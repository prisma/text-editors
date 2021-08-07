import {
  classHighlightStyle,
  HighlightStyle,
  tags,
} from "@codemirror/highlight";
import { EditorView } from "@codemirror/view";
import { base } from "./base";

export const theme = [
  base,
  // Overall editor theme
  EditorView.theme(
    {
      "&": {
        background: "#FFFFFF",
      },
      ".cm-scroller": { overflow: "auto" },
      ".cm-gutters": { background: "#FFFFFF" },
      ".cm-gutterElement": { color: "#CBD5E1" /* blueGray-300 */ },
      ".cm-foldMarker, .cm-foldRangeMarker": {
        color: "#475569" /* blueGray-600 */,
      },
      ".cm-activeLine, .cm-activeLineGutter": {
        background: "#F1F5F9" /* blueGray-100 */,
      },

      // Prisma Query Plugin
      ".cm-gutterElement .cm-prismaQuery": {
        borderLeftColor: "#22C55E" /* green-500 */,
      },
      ".cm-prismaQueryRunButton": {
        color: "#CBD5E1" /* blueGray-300 */,

        "&:hover": {
          color: "#94A3B8" /* blueGray-400 */,
        },
      },

      // Autocomplete
      ".cm-tooltip-autocomplete": {},
      ".cm-completionLabel": {}, // Unmatched text
      ".cm-completionMatchedText": {
        color: "#00B4D4",
      },
      ".cm-completionDetail": {
        color: "#ABABAB",
      }, // Text to the right of tooltip
      ".cm-completionInfo": {}, // "Additional" text that shows up in a panel on the right of the tolltip

      // Diagnostics (Lint issues) & Quickinfo (Hover tooltips)
      ".cm-diagnostic, .cm-quickinfo-tooltip": {
        background: "#E2E8F0" /* blueGray-200 */,
        border: "1px solid #CBD5E1" /* blueGray-300 */,
        color: "#1E293B" /* blueGray-800 */,
      },
    },
    { dark: false }
  ),

  // Syntax highlighting
  // This is a custom highlight style that only highlights Prisma Queries
  // TODO:: Move this into thie Prisma plugin
  classHighlightStyle,
  HighlightStyle.define([
    // `classHighlightStyle` is a little too generic for some things, so override it in those places
    {
      tag: [tags.function(tags.variableName), tags.function(tags.propertyName)],
      class: "cmt-function",
    },
  ]),
  EditorView.theme({
    ".cm-line": {
      color: "#52525B55" /* blueGray-600 */,
    },

    ".cm-prismaQuery": {
      // Keywords
      "& .cmt-keyword": { color: "#BE185D" /* pink-700 */ },

      // Literals
      "& .cmt-literal, & .cmt-bool": { color: "#0F766E" /* teal-700 */ },
      "& .cmt-string2": {
        color: "#0F766E" /* teal-700 */,
      },

      // Variables
      "& .cmt-definition.cmt-variableName": {
        color: "#1D4ED8" /* blue-700 */,
      },
      "& .cmt-variableName, & .cmt-typeName, & .cmt-namespace, & .cmt-className, & .cmt-punctuation":
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
  }),
];
