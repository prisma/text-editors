import { gutter, GutterMarker } from "@codemirror/gutter";
import { RangeSet, RangeSetBuilder } from "@codemirror/rangeset";
import { Extension, Facet, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  keymap,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { noop, over } from "lodash-es";
import { getQueries, PrismaQuery } from "./get-queries";
import { queryHighlightStyle } from "./highlight";
import { log } from "./log";

/**
 * This file exports an extension that makes Prisma Query functionality work. This includes:
 *
 * 1. A Facet that will be used to register one or more `onExecute` handlers. This facet's value will be accessible by the StateField
 * 2. A StateField that will hold ranges and values of PrismaClient queries
 * 3. A GutterMarker that displays an element in the gutter for all lines that are valid PrismaClient queries
 * 4. A widget that renders a DOM element to allow a PrismaClient query to be executed
 * 5. A ViewPlugin that draws the RunQueryWidget on all first lines of PrismaClient queries
 * 7. A custom highlight style that dims all lines that aren't PrismaClient queries
 * 6. A keyMap that runs the query under the user's cursor
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

/** A Widget that draws the `Run Query` button */
class RunQueryWidget extends WidgetType {
  private query: PrismaQuery;
  private indent: number;
  private onExecute?: OnExecute;

  constructor(params: {
    query: PrismaQuery;
    indent: number;
    onExecute?: OnExecute;
  }) {
    super();
    this.query = params.query;
    this.indent = params.indent;
    this.onExecute = params.onExecute;
  }

  ignoreEvent() {
    return false;
  }

  eq(other: RunQueryWidget) {
    return other.query == this.query;
  }

  toDOM = () => {
    const widget = document.createElement("div");
    // Indent the div so it looks like it starts right where the query starts (instead of starting where the line starts)
    widget.setAttribute("style", `margin-left: ${this.indent * 0.5}rem;`);

    // Since the top-most element has to be `display: block`, it will stretch to fill the entire line
    // We want to add a click listener, so attaching it to this outside div will make it so clicking anywhere on the line executes the query
    // To avoid this, we create a child button and add text and the click handler to it instead
    const button = document.createElement("button");
    button.textContent = "▶ Run Query";
    button.setAttribute("class", "cm-prismaQueryRunButton");
    if (this.onExecute) {
      button.onclick = () => {
        this.onExecute?.(this.query.text);
      };
    }

    widget.appendChild(button);

    return widget;
  };
}

/**
 * A ViewPlugin that draws `RunQueryWidget`s
 */
const runQueryViewPlugin = ViewPlugin.fromClass(
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
        .between(view.viewport.from, view.viewport.to, (from, to, query) => {
          const line = view.state.doc.lineAt(from);

          decorations.add(
            line.from,
            line.from,
            Decoration.widget({
              widget: new RunQueryWidget({
                query,
                indent: line.text.length - line.text.trim().length,
                onExecute: view.state.facet(OnExecuteFacet),
              }),
            })
          );
        });

      return decorations.finish();
    }
  },
  {
    decorations: value => value.decorations,
  }
);

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

// Export a function that will build & return an Extension
export function prismaQuery(config: { onExecute?: OnExecute }): Extension {
  return [
    OnExecuteFacet.of(config.onExecute || noop),
    prismaQueryStateField,
    gutter({
      lineMarker: (view, line) => {
        const cursors = view.state.selection.ranges.filter(r => r.empty);
        const cursorPos = cursors[0].from;

        // If cursor is inside the query, add (visible) markers for all lines in query (and invisible ones for others)
        // Toggling between visible/invisible instead of adding/removing markers makes it so the editor does not jump when a marker is shown as your cursor moves around
        let marker: QueryGutterMarker = new QueryGutterMarker(false);
        view.state
          .field(prismaQueryStateField)
          .between(line.from, line.to, (from, to) => {
            if (cursorPos >= from && cursorPos <= to) {
              marker = new QueryGutterMarker(true);
            }
          });

        return marker;
      },
    }),
    // runQueryViewPlugin,
    queryHighlightPlugin,
    queryHighlightStyle,
    keymap.of([
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
