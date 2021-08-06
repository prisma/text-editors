import {
  classHighlightStyle,
  HighlightStyle,
  Tag,
  tags,
} from "@codemirror/highlight";
import { EditorView } from "@codemirror/view";

export const theme = [
  // Overall editor theme
  EditorView.theme(
    {
      "&": {
        background: "#FFFFFF",
        fontSize: "14px",
      },
      ".cm-scroller": { overflow: "auto" },
      ".cm-gutters": { border: "none", background: "#FFFFFF" },
      // ".cm-foldGutter .cm-gutterElement": { color: "#4B5563" /* gray-600 */ },
      ".cm-gutterElement": { color: "#CBD5E1" /* gray-300 */ },
      ".cm-activeLine, .cm-activeLineGutter": {
        background: "#F1F5F9" /* blueGray-100 */,
      },

      // Prisma Query Plugin
      ".cm-query": {
        borderLeft: "2px solid #22C55E" /* green-500 */,
      },
      ".cm-run-query-button": {
        background: "transparent",
        border: 0,
        color: "#00000055",
        cursor: "pointer",
        fontSize: "12px",
        fontFamily: "monospace",

        "&:hover": {
          color: "#00000088",
        },
      },
    },
    { dark: false }
  ),

  classHighlightStyle,

  // Syntax highlighting
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
