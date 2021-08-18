import {
  classHighlightStyle,
  HighlightStyle,
  tags,
} from "@codemirror/highlight";
import { RangeSetBuilder } from "@codemirror/rangeset";
import { Extension } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { prismaQueryStateField } from "./state";

/**
 * This is a custom highlight style that only highlights Prisma Queries
 */
export const queryHighlightStyle = [
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
        color: "#94A3B8" /* blueGray-400 */,
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

/**
 * Plugin that adds a special class to all lines that are part of a Prisma Query
 */
const queryHighlightPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(viewUpdate: ViewUpdate) {
      if (viewUpdate.viewportChanged || viewUpdate.docChanged) {
        this.decorations = this.buildDecorations(viewUpdate.view);
      }
    }

    buildDecorations(view: EditorView) {
      let decorations = new RangeSetBuilder<Decoration>();
      view.state
        .field(prismaQueryStateField)
        .between(view.viewport.from, view.viewport.to, (from, to) => {
          const lineStart = view.state.doc.lineAt(from);
          const lineEnd = view.state.doc.lineAt(to);

          new Array(lineEnd.number - lineStart.number + 1)
            .fill(undefined)
            .forEach((_, i) => {
              const line = view.state.doc.line(lineStart.number + i);
              decorations.add(
                line.from,
                line.from,
                Decoration.line({
                  attributes: {
                    class: "cm-prismaQuery",
                  },
                })
              );
            });
        });

      return decorations.finish();
    }
  },
  {
    decorations: value => value.decorations,
  }
);

export function highlightStyle(): Extension {
  return [queryHighlightPlugin, queryHighlightStyle];
}
