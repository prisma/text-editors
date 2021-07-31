import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/rangeset";
import { EditorState, StateField } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";

const highlightDecoration = Decoration.line({
  attributes: { class: "cm-query" },
});

function getDecorationRanges() {}

function getDecorationsFromState(
  state: EditorState,
  from?: number,
  to?: number
) {
  const builder = new RangeSetBuilder<Decoration>();

  let prismaVariableName: string;

  const syntax = syntaxTree(state);

  syntax.iterate({
    from,
    to,
    enter(type, from) {
      // We assume that the PrismaClient instantiation happens before queries are made
      // We will traverse the syntax tree and find:
      // 1. The name of the variable holding the PrismaClient instance
      // 2. All AwaitExpressions that use this instance
      // These two _should_ be sufficient in identifying queries

      if (type.name === "NewExpression") {
        // This `if` branch finds the PrismaClient instance variable name

        // Check if this `new` expressions is for the PrismaClient constructor
        // TODO:: Do NOT use syntax.resolve, it will fail if there are multiple spaces after `new`
        const identifier = syntax.resolve(from + "new ".length, 1);
        const identifierName = state.sliceDoc(identifier.from, identifier.to);

        if (identifierName !== "PrismaClient") {
          return;
        }

        // If it is, find the name of the variable so we can use it to identify PrismaClient calls
        const variableDeclaration = identifier.parent?.parent;
        if (!variableDeclaration) {
          return;
        }

        const variableDefinition =
          variableDeclaration.getChild("VariableDefinition");
        if (!variableDefinition) {
          return;
        }

        prismaVariableName = state.sliceDoc(
          variableDefinition.from,
          variableDefinition.to
        );
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
        // |-------------------------|             |----------------------|
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

          // Add ranges for each line this query exists in
          // If you change this, be sure to also change range addition logic for the other kind of query down below
          const lineStart = state.doc.lineAt(callExpression.from);
          const lineEnd = state.doc.lineAt(callExpression.to);

          for (let i = lineStart.number; i <= lineEnd.number; i++) {
            const line = state.doc.line(i);
            builder.add(line.from, line.from, highlightDecoration);
          }

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

        // Add ranges for each line this query exists in
        // If you change this, be sure to also change range addition logic for the other kind of query up above
        const lineStart = state.doc.lineAt(callExpression.from);
        const lineEnd = state.doc.lineAt(callExpression.to);

        for (let i = lineStart.number; i <= lineEnd.number; i++) {
          const line = state.doc.line(i);
          builder.add(line.from, line.from, highlightDecoration);
        }

        return;
      }
    },
  });

  return builder.finish();
}

/** State field that tracks which ranges are PrismaClient queries */
export const queryHighlightsStateField = StateField.define<DecorationSet>({
  create(state) {
    return getDecorationsFromState(state);
  },

  update(value, transaction) {
    value = value.map(transaction.changes);

    if (transaction.docChanged) {
      return getDecorationsFromState(transaction.state);
    }

    return value;
  },

  provide: field =>
    EditorView.decorations.compute([field], state => state.field(field)),
});
