import {
  classHighlightStyle,
  HighlightStyle,
  tags,
} from "@codemirror/highlight";
import { EditorView } from "@codemirror/view";

export const queryHighlightStyle = [
  // Syntax highlighting
  // This is a custom highlight style that only highlights Prisma Queries
  classHighlightStyle,
  HighlightStyle.define([
    // `classHighlightStyle` is a little too generic for some things, so override it in those places
    {
      tag: [tags.function(tags.variableName), tags.function(tags.propertyName)],
      class: "cmt-function",
    },
  ]),
  EditorView.baseTheme({
    "&light": {
      // Dim everything first, then selectively add colors to tokens
      "& .cm-line": {
        color: "#52525B55" /* blueGray-600 */,
      },

      "& .cm-prismaQuery": {
        // Keywords
        "& .cmt-keyword": { color: "#BE185D" /* pink-700 */ },

        // Literals
        "& .cmt-literal, & .cmt-bool": { color: "#0F766E" /* teal-700 */ },
        "& .cmt-string, & .cmt-string2": {
          color: "#0F766E" /* teal-700 */,
        },

        // Variables
        "& .cmt-definition.cmt-variableName": {
          color: "#1D4ED8" /* blue-700 */,
        },
        "& .cmt-variableName, & .cmt-typeName, & .cmt-namespace, & .cmt-className, & .cmt-punctuation, & .cmt-operator":
          {
            color: "#1E293B" /* blueGray-800 */,
          },
        "& .cmt-propertyName": {
          color: "#9333EA" /* purple-700 */,
        },
        "& .cmt-function": {
          color: "#EA580C" /* orange-600 */,
        },

        // Misc
        "& .cmt-comment": {
          color: "#52525B" /* blueGray-600 */,
        },
      },
    },

    // TODO:: Dark base theme
    "&dark": {},
  }),
];
