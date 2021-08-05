import { syntaxTree } from "@codemirror/language";
import { RangeSet } from "@codemirror/rangeset";
import { EditorState, Extension, Facet, StateField } from "@codemirror/state";
import { Decoration, EditorView, keymap, WidgetType } from "@codemirror/view";
import { noop, over } from "lodash-es";
import { logger } from "../../logger";

const log = logger("prisma-query-extension", "grey");

/**
 * There's a lot of stuff here, but it is all tightly connected:
 *
 * 1. A StateField that will hold positions and values of PrismaClient queries
 * 2. A line Decoration that will add a special class to all lines in view that are known to contain PrismaClient queries (as stored in the StateField)
 * 3. A widget Decoration that will add a DOM element on the first line where a query is known to exist (as stored in the StateField)
 * 4. A Facet that will be used to register one or more `onExecute` handler. This facet's value will be accessible by the StateField
 * 5. A keyMap that will be used to execute the query your cursor is on when you press a combination of keys
 * 6. An Extension that packages all of this up in one function that can be invoked to add this extension to the EditorView
 */

/** A single PrismaClient query */
type PrismaQuery = {
  text: string;
  from: number;
  to: number;
  variables: Record<string, string>;
};
/** A set of valid PrismaClient queries and their decoration ranges. Values of this type will eventually end up as an EditorState field */
type PrismaQueries = {
  /** Set of all found queries */
  queries: PrismaQuery[];
  /** Their Decoration ranges */
  decorations: RangeSet<Decoration>;
};

type PrismaQueryOnExecute = (query: string) => void;
/** Facet to allow configuring query execution callback */
type PrismaQueryFacet = { onExecute?: PrismaQueryOnExecute };
const prismaQueriesFacet = Facet.define<PrismaQueryFacet, PrismaQueryFacet>({
  combine: input => {
    return {
      // If multiple `onExecuteQuery` callbacks are registered, chain them (call them one after another)
      onExecute: over(input.map(i => i.onExecute || noop)) || noop,
    };
  },
});

/** A Widget that draws the `Run Query` button */
class RunQueryWidget extends WidgetType {
  private query: PrismaQuery;
  private indent: number;
  private onExecute?: PrismaQueryOnExecute;

  constructor(params: {
    query: PrismaQuery;
    indent: number;
    onExecute?: PrismaQueryOnExecute;
  }) {
    super();
    this.query = params.query;
    this.indent = params.indent;
    this.onExecute = params.onExecute;
  }

  ignoreEvent() {
    return false;
  }

  eq(other: RunQueryWidget) {
    return other.query.from == this.query.from; // It is enough to check the `from`s because two queries cannot start at the same location
  }

  toDOM = () => {
    const widget = document.createElement("div");
    // Indent the div so it looks like it starts right where the query starts (instead of starting where the line starts)
    widget.setAttribute("style", `margin-left: ${this.indent * 0.5}rem;`);

    // Since the top-most element has to be `display: block`, it will stretch to fill the entire line
    // We want to add a click listener, so attaching it to this outside div will make it so clicking anywhere on the line executes the query
    // To avoid this, we create a child button and add the `innerText` and the click handler to it instead
    const button = document.createElement("button");
    button.innerText = "▶ Run Query";
    button.setAttribute("class", "cm-run-query-button");
    if (this.onExecute) {
      button.onclick = () => {
        this.onExecute?.(this.query.text);
      };
    }

    widget.appendChild(button);

    return widget;
  };
}

function findQueries(state: EditorState): PrismaQueries {
  const syntax = syntaxTree(state);
  const queries: PrismaQueries["queries"] = [];
  let decorationSet: RangeSet<Decoration> = RangeSet.empty;

  function addQuery(query: PrismaQuery) {
    // Add text of this query
    queries.push(query);

    // If you change this, be sure to also change range addition logic for the other kind of query down below
    const lineStart = state.doc.lineAt(query.from);
    const lineEnd = state.doc.lineAt(query.to);

    // Add line decorations for each line this query exists in
    decorationSet = decorationSet.update({
      add: new Array(lineEnd.number - lineStart.number + 1)
        .fill(undefined)
        .map((_, i) => {
          const line = state.doc.line(lineStart.number + i);
          return {
            from: line.from,
            to: line.from, // Line decorations must start and end on the same line
            value: Decoration.line({
              attributes: { class: "cm-query" },
            }),
          };
        }),
      sort: true,
    });

    // Add a widget decoration to be able to run this query
    decorationSet = decorationSet.update({
      add: [
        {
          from: lineStart.from,
          to: lineStart.from,
          value: Decoration.widget({
            widget: new RunQueryWidget({
              query,
              indent: lineStart.text.length - lineStart.text.trim().length,
              onExecute: state.facet(prismaQueriesFacet).onExecute,
            }),
            side: -1,
          }),
        },
      ],
      sort: true,
    });
  }

  let prismaVariableName: string;

  syntax.iterate({
    enter(type, from) {
      // We assume that the PrismaClient instantiation happens before queries are made
      // We will traverse the syntax tree and find:
      // 1. The name of the variable holding the PrismaClient instance
      // 2. All AwaitExpressions that use this instance
      // These two _should_ be sufficient in identifying queries
      //
      // If debugging, it is possible to see what SyntaxNode you're on by slicing the state doc around it like so:
      //   log({ text: state.sliceDoc(variableDeclaration.from, variableDeclaration.to) });
      // This will give you a readable representation of the node you're working with

      if (type.name === "NewExpression") {
        // This `if` branch finds the PrismaClient instance variable name

        // Check if this `new` expressions is for the PrismaClient constructor

        // First, get the `new` keyword in question
        // const prisma = new PrismaClient()
        //                |-|
        const newKeyword = syntax.resolve(from, 1);
        if (newKeyword?.name !== "new") {
          return;
        }

        // Next, make sure the `new` keyword is initializing a variable
        // const prisma = new PrismaClient()
        //                    |------------|
        const identifier = newKeyword.nextSibling;
        if (identifier?.name !== "VariableName") {
          return;
        }

        // Then, we can find the name of the identifier, which is the name of the class the `new` keyword is instantiating
        // const prisma = new PrismaClient()
        //                    |----------|
        const identifierName = state.sliceDoc(identifier.from, identifier.to);
        if (identifierName !== "PrismaClient") {
          // If the identifier isn't `PrismaClient`, it means this `new` keyword is instantiating an irrelevant class
          return;
        }

        // If this is a `new PrismaClient` call, find the name of the variable so we can use it to identify PrismaClient calls

        // First, we try to go two parents up, to find the VariableDeclaration
        // const prisma = new PrismaClient()
        // |-------------------------------|
        const variableDeclaration = newKeyword.parent?.parent;
        if (variableDeclaration?.name !== "VariableDeclaration") {
          return;
        }

        // Then, we find its first child, which should be the variable name
        // const prisma = new PrismaClient()
        // |---|
        const constDeclaration = variableDeclaration.firstChild;
        if (constDeclaration?.name !== "const") {
          return;
        }

        // Then, we find the ConstDeclaration's sibling
        // const prisma = new PrismaClient()
        //       |----|
        const variableName = constDeclaration.nextSibling;
        if (variableName?.name !== "VariableDefinition") {
          return;
        }

        // Now that we know the bounds of the variable name, we can slice the doc to find out what its value is
        prismaVariableName = state.sliceDoc(variableName.from, variableName.to);
      } else if (type.name === "UnaryExpression") {
        // This branch finds actual queries using the PrismaClient instance variable name

        if (!prismaVariableName) {
          // If a PrismaClient instance variable hasn't been found yet, bail, because we cannot possibly find queries
          return;
        }

        // We need to find two kinds of Prisma Client calls:
        // `await prisma.user.findMany({})`
        // `await prisma.$connect()`
        // Over the course of this function, we'll try to aggresively return early as soon as we discover that the syntax node is not of interest to us

        // Terminology here is a mix of JS grammar from ASTExplorer and CodeMirror's Lezer grammar: https://github.com/lezer-parser/javascript/blob/master/src/javascript.grammar
        // It is worth it to get familiar with JS grammar and the tree structure before attempting to understand this function

        // First, make sure this UnaryExpression is an AwaitExpression
        // This bails if this syntax node does not have an `await` keyword
        // We want this because both queries we're trying to parse have `await`s
        // await prisma.user.findMany()     OR     await prisma.$queryRaw()
        // |---|                                   |---|
        const awaitKeyword = syntax.resolve(from, 1);
        if (awaitKeyword.name !== "await") {
          return;
        }

        // Next, make sure this is a CallExpression
        // This bails if the await is not followed by a function call expression
        // We want this because both queries we're trying to parse have a function call
        // await prisma.user.findMany()     OR     await prisma.$queryRaw()
        //       |--------------------|                  |----------------|
        const callExpression = awaitKeyword.nextSibling;
        if (callExpression?.name !== "CallExpression") {
          return;
        }

        // Next, make sure the CallExpression's first child is a MemberExpression
        // This bails if the function call expression does not have a member expression inside it.
        // We want this because both kinds of queries we're trying to parse have a member expression inside a call expression.
        // await prisma.user.findMany()     OR     await prisma.$queryRaw()
        //       |---------|                             |----|
        const memberExpression = callExpression?.firstChild;
        if (memberExpression?.name !== "MemberExpression") {
          return;
        }

        // If the MemberExpression's first child is a VariableName, we might have found a query like: `prisma.$queryRaw`
        const maybeVariableNameInsideMemberExpression =
          memberExpression.firstChild;
        if (!maybeVariableNameInsideMemberExpression) {
          // If the MemberExpression does not have a child at all, then it cannot be of either form, so bail
          return;
        }
        if (maybeVariableNameInsideMemberExpression?.name === "VariableName") {
          if (
            state.sliceDoc(
              maybeVariableNameInsideMemberExpression.from,
              maybeVariableNameInsideMemberExpression.to
            ) !== prismaVariableName
          ) {
            // But if the variable name is not `prismaVariableName`, then this is a dud. It cannot be of the form `prisma.user.findMany()` either, so we bail
            return;
          }

          addQuery({
            text: state.doc.sliceString(callExpression.from, callExpression.to),
            from: callExpression.from,
            to: callExpression.to,
            variables: {},
          });

          return;
        }

        // The only kind of query this can be at this point is of the form `prisma.user.findMany()`
        // If the MemberExpression's first child was not a VariableName, then its grandchild must be.
        // await prisma.user.findMany()
        //       |----|
        const maybeVariableNameInsideMemberExpressionInsideMemberExpression =
          maybeVariableNameInsideMemberExpression.firstChild;
        if (
          maybeVariableNameInsideMemberExpressionInsideMemberExpression?.name !==
          "VariableName"
        ) {
          return;
        }

        if (
          state.sliceDoc(
            maybeVariableNameInsideMemberExpressionInsideMemberExpression.from,
            maybeVariableNameInsideMemberExpressionInsideMemberExpression.to
          ) !== prismaVariableName
        ) {
          // But if the variable name is not `prismaVariableName`, then this is a dud. It cannot be of any other form, so bail
          return;
        }

        // Add text of this query
        addQuery({
          text: state.doc.sliceString(callExpression.from, callExpression.to),
          from: callExpression.from,
          to: callExpression.to,
          variables: {},
        });

        return;
      }
    },
  });

  return { queries, decorations: decorationSet };
}

/** State field that tracks which ranges are PrismaClient queries */
const prismaQueryStateField = StateField.define<PrismaQueries>({
  create(state) {
    return findQueries(state);
  },

  update(value, transaction) {
    value.decorations = value.decorations.map(transaction.changes);

    if (transaction.docChanged) {
      return findQueries(transaction.state);
    }

    return value;
  },

  provide: field =>
    EditorView.decorations.compute(
      [field],
      state => state.field(field).decorations
    ),
});

// Export a function that will build & return an Extension
export function prismaQuery(
  config: {
    onExecute?: PrismaQueryOnExecute;
  } = {}
): Extension {
  return [
    prismaQueriesFacet.of(config),
    prismaQueryStateField,
    keymap.of([
      {
        key: "Ctrl-Enter",
        mac: "Mod-Enter",
        run: ({ state }) => {
          const { onExecute } = state.facet(prismaQueriesFacet);
          if (!onExecute) {
            // If there is no `onExecute` callback registered, bail
            return false;
          }

          const cursors = state.selection.ranges.filter(r => r.empty);
          const firstCursor = cursors[0];

          if (!firstCursor) {
            log("Unable to find cursors, bailing");
            return true;
          }

          const queries = state.field(prismaQueryStateField);

          const relevantQuery = queries.queries.find(
            q => firstCursor.from >= q.from && firstCursor.to <= q.to
          );

          if (!relevantQuery) {
            log("Unable to find relevant query, bailing");
            return true;
          }

          log("Running query", relevantQuery.text);
          onExecute(relevantQuery.text);

          return true;
        },
      },
    ]),
  ];
}
