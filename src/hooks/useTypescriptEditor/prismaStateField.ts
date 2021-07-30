import { syntaxTree } from "@codemirror/language";
import { StateField } from "@codemirror/state";
import { log } from "./log";

/** An editor StateField that stores information about the PrismaClient instance */
type PrismaStateField = {
  /** Name of the PrismaClient instance variable */
  variableName?: string;
};

export const prismaStateField = StateField.define<PrismaStateField>({
  create: state => {
    let variableName;

    log("Creating prismaStateField");
    const syntax = syntaxTree(state);
    syntax.iterate({
      enter(type, from) {
        if (type.name === "NewExpression") {
          // Check if this `new` expressions is for the PrismaClient constructor
          const identifier = syntax.resolve(from + "new ".length, 1);
          const identifierName = state.doc.sliceString(
            identifier.from,
            identifier.to
          );

          if (identifierName === "PrismaClient") {
            // If it is, find the name of the variable so we can use it to identify PrismaClient calls
            const variableDeclaration = identifier.parent?.parent;
            if (!variableDeclaration) {
              log(
                "Unable to find variable declaration from PrismaClient constructor, bailing"
              );
              return;
            }

            const variableDefinition =
              variableDeclaration.getChild("VariableDefinition");
            if (!variableDefinition) {
              log(
                "Unable to find variable definition from PrismaClient constructor, bailing"
              );
              return;
            }

            variableName = state.doc.sliceString(
              variableDefinition.from,
              variableDefinition.to
            );
          }
        }
      },
    });

    const fieldValue = { variableName };
    log("Created prismaStateField", fieldValue);
    return fieldValue;
  },
  update: (value, transaction) => {
    log(transaction.changes);
    return { variableName: "prisma" };
  },
});
