import { gutter as cmGutter, GutterMarker } from "@codemirror/gutter";
import { RangeSet, RangeSetBuilder } from "@codemirror/rangeset";
import { Extension, Facet, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  keymap as keymapFacet,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { noop, over } from "lodash-es";
import { getQueries, PrismaQuery } from "./get-queries";
import { queryHighlightStyle } from "./highlight";
import { log } from "./log";

/**
 * This file exports multiple extensions that make Prisma Query functionality work. This includes:
 *
 * 1. A Facet that will be used to register one or more `onExecute` handlers. This facet's value will be accessible by the StateField
 * 2. A StateField that will hold ranges and values of PrismaClient queries
 * 3. A `track` extension that tracks Prisma Client queries in the editor
 *
 * 3. A GutterMarker that displays an element in the gutter for all lines that are valid PrismaClient queries
 * 4. A GutterMarker that displays a run button in the gutter for all lines that are valid PrismaClient queries
 * 5. A widget that renders a DOM element to allow a PrismaClient query to be executed
 * 6. A custom highlight style that dims all lines that aren't PrismaClient queries
 * 7. A keyMap that runs the query under the user's cursor
 *
 * The "correct" way to read this file is from bottom to top.
 */

/**
 * Facet to allow configuring query execution callback
 */
export type OnExecute = (query: string) => void;
export const OnExecuteFacet = Facet.define<OnExecute, OnExecute>({
  combine: input => {
    // If multiple `onExecute` callbacks are registered, chain them (call them one after another)
    return over(input);
  },
});

/**
 * State field that tracks which ranges are PrismaClient queries.
 * We don't store a DecorationSet directly in the StateField because we need to be able to find the `text` of a query
 */
const prismaQueryStateField = StateField.define<RangeSet<PrismaQuery>>({
  create(state) {
    return getQueries(state);
  },

  update(value, transaction) {
    if (transaction.docChanged) {
      return getQueries(transaction.state);
    }

    return value;
  },
});

export function track(config: { onExecute?: OnExecute }): Extension {
  return [OnExecuteFacet.of(config.onExecute || noop), prismaQueryStateField];
}

/**
 * A GutterMarker that marks lines that have valid PrismaClient queries
 */
class QueryGutterMarker extends GutterMarker {
  isVisible: boolean;

  constructor(isVisible: boolean) {
    super();
    this.isVisible = isVisible;
  }

  toDOM() {
    const div = document.createElement("div");
    div.className = "cm-prismaQuery";
    if (!this.isVisible) {
      div.classList.add("invisible");
    }
    return div;
  }
}

export function gutter(): Extension {
  return [
    cmGutter({
      lineMarker: (view, line) => {
        const cursors = view.state.selection.ranges;
        const cursor = cursors[0];

        // If (beginning of) selection range (aka the cursor) is inside the query, add (visible) markers for all lines in query (and invisible ones for others)
        // Toggling between visible/invisible instead of adding/removing markers makes it so the editor does not jump when a marker is shown as your cursor moves around
        let marker: QueryGutterMarker = new QueryGutterMarker(false);
        view.state
          .field(prismaQueryStateField)
          .between(line.from, line.to, (from, to) => {
            if (cursor?.from >= from && cursor?.from <= to) {
              marker = new QueryGutterMarker(true);
            }
          });

        return marker;
      },
    }),
    // Gutter line marker styles
    EditorView.baseTheme({
      ".cm-gutterElement .cm-prismaQuery": {
        height: "100%",
        borderLeft: "3px solid #22C55E" /* green-500 */,

        "&.invisible": {
          borderLeft: "3px solid transparent",
        },
      },
    }),
  ];
}

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

/**
 * A GutterMarker that shows line numbers that change to a run button when hovered over
 */
class LineNumberMarker extends GutterMarker {
  private number: number;
  public elementClass: string;

  constructor(number: number) {
    super();

    this.number = number;
    this.elementClass = "cm-lineNumbers";
  }

  eq(other: LineNumberMarker) {
    return false; // No two line number widgets can be the same
  }

  toDOM(view: EditorView) {
    const widget = document.createElement("div");
    widget.classList.add("cm-gutterElement");
    widget.textContent = `${this.number}`;
    return widget;
  }
}

/**
 * A GutterMarker that shows line numbers that change to a run button when hovered over
 */
class RunQueryMarker extends GutterMarker {
  private number: number;
  public elementClass: string;

  constructor(number: number) {
    super();

    this.number = number;
    this.elementClass = "cm-lineNumbers";
  }

  eq(other: RunQueryMarker) {
    return false; // No two run query widgets can be the same
  }

  toDOM(view: EditorView) {
    const widget = document.createElement("div");
    widget.classList.add("cm-gutterElement");
    widget.textContent = `${this.number}`;

    const queries = view.state.field(prismaQueryStateField);

    const onExecute = view.state.facet(OnExecuteFacet);
    return widget;
  }
}

export function lineNumbers(): Extension {
  return [
    cmGutter({
      lineMarker: (view, line, others) => {
        return new LineNumberMarker(view.state.doc.lineAt(line.from).number);
      },
    }),
  ];
}

export function keymap(): Extension {
  return [
    keymapFacet.of([
      {
        key: "Ctrl-Enter",
        mac: "Mod-Enter",
        run: ({ state }) => {
          const onExecute = state.facet(OnExecuteFacet);
          const cursors = state.selection.ranges.filter(r => r.empty);
          const firstCursor = cursors[0];

          if (!firstCursor) {
            log("Unable to find cursors, bailing");
            return true;
          }

          let query: string | null = null;
          state
            .field(prismaQueryStateField)
            .between(firstCursor.from, firstCursor.to, (from, to, q) => {
              query = q.text;
              return false;
            });

          if (!query) {
            log("Unable to find relevant query, bailing");
            return true;
          }

          log("Running query", query);
          onExecute(query);
          return true;
        },
      },
    ]),
  ];
}
