import {
  classHighlightStyle,
  HighlightStyle,
  Tag,
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
      ".cm-query": {
        borderLeftColor: "#22C55E" /* green-500 */,
      },
      ".cm-run-query-button": {
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
        borderColor: "#CBD5E1" /* blueGray-300 */,
      },
    },
    { dark: false }
  ),

  // Syntax highlighting
  classHighlightStyle,
  HighlightStyle.define(
    [
      // Keywords
      { tag: tags.keyword, color: "#BE185D" /* pink-700 */ },

      // Literals
      { tag: [tags.literal, tags.bool], color: "#0F766E" /* teal-700 */ },
      {
        tag: [tags.string, tags.special(tags.string), tags.regexp],
        color: "#0F766E" /* teal-700 */,
      },
      {
        tag: tags.escape,
        color: "#10B981" /* green-500 */,
      },

      // Variables
      {
        tag: [
          tags.definition(tags.variableName),
          tags.definition(tags.typeName),
          tags.definition(tags.namespace),
          tags.definition(tags.className),
        ],
        color: "#1D4ED8" /* blue-700 */,
      },
      {
        tag: [
          tags.variableName,
          tags.typeName,
          tags.namespace,
          tags.className,
          tags.operator,
          tags.bracket,
        ],
        color: "#1E293B" /* blueGray-800 */,
      },
      {
        tag: [tags.propertyName, tags.definition(tags.propertyName)],
        color: "#9333EA" /* purple-700 */,
      },
      {
        tag: [
          tags.function(tags.variableName),
          tags.function(tags.propertyName),
        ],
        color: "#EA580C" /* orange-600 */,
      },

      // Misc
      {
        tag: tags.comment,
        color: "#52525B" /* blueGray-600 */,
        opacity: 0.5,
      },
      { tag: tags.invalid, color: "#000000" /*  */ },
      {
        // Custom tag for invisible things?
        tag: Tag.define(),
      },
    ],
    {}
  ),
];
