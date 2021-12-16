import { syntaxTree } from "@codemirror/language";
import { RangeSet, RangeSetBuilder, RangeValue } from "@codemirror/rangeset";
import { EditorState } from "@codemirror/state";
import RJSON from "relaxed-json";

export type PrismaQuery = {
  modelName?: string;
  operation: string;
  args?: string | Record<string, any>;
};

/** A Range representing a single PrismaClient query */
export class PrismaQueryRangeValue extends RangeValue {
  public query: PrismaQuery;

  constructor({ modelName, operation, args }: PrismaQuery & { args?: string }) {
    super();

    this.query = {
      modelName,
      operation,
      args,
    };

    if (args) {
      // Try to parse arguments (they will be an object for `prisma.user.findMany({ ... }))`-type queries
      try {
        this.query.args = RJSON.parse(args); // Need a more relaxed JSON.parse (read `https://github.com/phadej/relaxed-json` to understand why)
      } catch (_) {}
    }
  }
}

/**
 * Given an EditorState, returns positions of and decorations associated with all Prisma Client queries
 */
export function findQueries(
  state: EditorState
): RangeSet<PrismaQueryRangeValue> {
  // JS grammar: https://github.com/lezer-parser/javascript/blob/main/src/javascript.grammar
  const syntax = syntaxTree(state);

  let prismaVariableName: string;
  let queries = new RangeSetBuilder<PrismaQueryRangeValue>();

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
        if (newKeyword?.name !== "new") return;

        // Next, make sure the `new` keyword is initializing a variable
        // const prisma = new PrismaClient()
        //                    |------------|
        const identifier = newKeyword.nextSibling;
        if (identifier?.name !== "VariableName") return;

        // Then, we can find the name of the identifier, which is the name of the class the `new` keyword is instantiating
        // const prisma = new PrismaClient()
        //                    |----------|
        const identifierName = state.sliceDoc(identifier.from, identifier.to);
        // If the identifier isn't `PrismaClient`, it means this `new` keyword is instantiating an irrelevant class
        if (identifierName !== "PrismaClient") return;

        // If this is a `new PrismaClient` call, find the name of the variable so we can use it to identify PrismaClient calls

        // First, we try to go two parents up, to find the VariableDeclaration
        // const prisma = new PrismaClient()
        // |-------------------------------|
        const variableDeclaration = newKeyword.parent?.parent;
        if (variableDeclaration?.name !== "VariableDeclaration") return;

        // Then, we find its first child, which should be the variable name
        // const prisma = new PrismaClient()
        // |---|
        const constDeclaration = variableDeclaration.firstChild;
        if (constDeclaration?.name !== "const") return;

        // Then, we find the ConstDeclaration's sibling
        // const prisma = new PrismaClient()
        //       |----|
        const variableName = constDeclaration.nextSibling;
        if (variableName?.name !== "VariableDefinition") return;

        // Now that we know the bounds of the variable name, we can slice the doc to find out what its value is
        prismaVariableName = state.sliceDoc(variableName.from, variableName.to);
      } else if (type.name === "UnaryExpression") {
        // This branch finds actual queries using the PrismaClient instance variable name

        // If a PrismaClient instance variable hasn't been found yet, bail, because we cannot possibly find queries
        if (!prismaVariableName) return;

        // We need to find two kinds of Prisma Client calls:
        // `await prisma.user.findMany({})`
        // `await prisma.$connect()`
        // Over the course of this function, we'll try to aggresively return early as soon as we discover that the syntax node is not of interest to us

        // Terminology here is a mix of JS grammar from ASTExplorer and CodeMirror's Lezer grammar: https://github.com/lezer-parser/javascript/blob/master/src/javascript.grammar
        // It is worth it to get familiar with JS grammar and the tree structure before attempting to understand this function

        // A Prisma Client query has three parts:
        let modelName: string | undefined = undefined; // A modelName (self explanatory) if it is of the form `prisma.user.findMany()`. Optional.
        let operation: string | undefined = undefined; // Like `findMany` / `count` / `$queryRaw` etc. Required.
        let args: string | undefined = undefined; // Arguments passed to the operation function call. Optional.

        // First, make sure this UnaryExpression is an AwaitExpression
        // This bails if this syntax node does not have an `await` keyword
        // We want this because both queries we're trying to parse have `await`s
        // await prisma.user.findMany()     OR     await prisma.$queryRaw()
        // |---|                                   |---|
        const awaitKeyword = syntax.resolve(from, 1);
        if (awaitKeyword.name !== "await") return;

        // Next, make sure this is a CallExpression
        // This bails if the await is not followed by a function call expression
        // We want this because both queries we're trying to parse have a function call
        // await prisma.user.findMany()     OR     await prisma.$queryRaw()
        //       |--------------------|                  |----------------|
        const callExpression = awaitKeyword.nextSibling;
        if (callExpression?.name !== "CallExpression") return;

        if (
          callExpression.lastChild // The arguments
        ) {
          const argsExpression =
            callExpression.lastChild.getChild("ObjectExpression") || // For `prisma.user.findMany({})`-type queries
            callExpression.lastChild.getChild("TemplateString") || // For `prisma.$queryRaw(`...`)`-type queries
            callExpression.lastChild.getChild("String"); // For `prisma.$queryRaw("...")`-type queries

          if (argsExpression)
            args = state.sliceDoc(argsExpression.from, argsExpression.to);
        }
        // Next, make sure the CallExpression's first child is a MemberExpression
        // This bails if the function call expression does not have a member expression inside it.
        // We want this because both kinds of queries we're trying to parse have a member expression inside a call expression.
        // await prisma.user.findMany()     OR     await prisma.$queryRaw()
        //       |---------|                             |----|
        const memberExpression = callExpression?.firstChild;
        if (memberExpression?.name !== "MemberExpression") return;

        if (memberExpression.lastChild) {
          operation = state.sliceDoc(
            memberExpression.lastChild.from,
            memberExpression.lastChild.to
          );
        }

        // If the MemberExpression's first child is a VariableName, we might have found a query like: `prisma.$queryRaw`
        const maybeVariableNameInsideMemberExpression =
          memberExpression.firstChild;
        // If the MemberExpression does not have a child at all, then it cannot be of either form, so bail
        if (!maybeVariableNameInsideMemberExpression) return;

        // If the MemberExpression's first child is a VariableName, we might have found a query like: `prisma.$queryRaw`
        if (maybeVariableNameInsideMemberExpression?.name === "VariableName") {
          // But if the variable name is not `prismaVariableName`, then this is a dud. It cannot be of the form `prisma.user.findMany()` either, so we bail
          if (
            state.sliceDoc(
              maybeVariableNameInsideMemberExpression.from,
              maybeVariableNameInsideMemberExpression.to
            ) !== prismaVariableName
          )
            return;

          // Add query of form `prisma.$queryRaw(...)`
          if (operation && args) {
            queries.add(
              callExpression.from,
              callExpression.to,
              new PrismaQueryRangeValue({ modelName, operation, args })
            );
          }

          return;
        }

        // The only kind of query this can be at this point is of the form `prisma.user.findMany()`
        // If the MemberExpression's first child was not a VariableName (previous `if` statement), then its grandchild must be.
        // await prisma.user.findMany()
        //       |----|
        const maybeVariableNameInsideMemberExpressionInsideMemberExpression =
          maybeVariableNameInsideMemberExpression.firstChild;
        if (
          maybeVariableNameInsideMemberExpressionInsideMemberExpression?.name !==
          "VariableName"
        )
          return;

        // But if the variable name is not `prismaVariableName`, then this is a dud. It cannot be of any other form, so bail
        if (
          state.sliceDoc(
            maybeVariableNameInsideMemberExpressionInsideMemberExpression.from,
            maybeVariableNameInsideMemberExpressionInsideMemberExpression.to
          ) !== prismaVariableName
        )
          return;

        if (maybeVariableNameInsideMemberExpression.lastChild) {
          modelName = state.sliceDoc(
            maybeVariableNameInsideMemberExpression.lastChild.from,
            maybeVariableNameInsideMemberExpression.lastChild.to
          );
        }

        // Add query of form `prisma.user.findMany({ ... })`
        if (modelName && operation) {
          queries.add(
            callExpression.from,
            callExpression.to,
            new PrismaQueryRangeValue({
              modelName,
              operation,
              args,
            })
          );
        }

        return;
      }
    },
  });

  return queries.finish();
}
