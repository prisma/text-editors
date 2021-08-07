import { syntaxTree } from "@codemirror/language";
import { RangeSet, RangeSetBuilder, RangeValue } from "@codemirror/rangeset";
import { EditorState } from "@codemirror/state";

/** A Range representing a single PrismaClient query */
export class PrismaQuery extends RangeValue {
  text: string;

  constructor(text: string) {
    super();

    this.text = text;
  }
}

/**
 * Given an EditorState, returns positions of and decorations associated with all Prisma Client queries
 */
export function getQueries(state: EditorState): RangeSet<PrismaQuery> {
  const syntax = syntaxTree(state);

  let prismaVariableName: string;
  let queries = new RangeSetBuilder<PrismaQuery>();

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

          queries.add(
            callExpression.from,
            callExpression.to,
            new PrismaQuery(
              state.doc.sliceString(callExpression.from, callExpression.to)
            )
          );

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
        queries.add(
          callExpression.from,
          callExpression.to,

          new PrismaQuery(
            state.doc.sliceString(callExpression.from, callExpression.to)
          )
        );

        return;
      }
    },
  });

  return queries.finish();
}
