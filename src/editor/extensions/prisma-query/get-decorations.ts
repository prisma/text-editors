import { RangeSet } from "@codemirror/rangeset";
import { EditorState } from "@codemirror/state";
import { Decoration, WidgetType } from "@codemirror/view";
import { OnExecute, OnExecuteFacet } from ".";
import { PrismaQuery } from "./get-queries";

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
    return other.query.from == this.query.from; // It is enough to check the `from`s because two queries cannot start at the same location
  }

  toDOM = () => {
    const widget = document.createElement("div");
    // Indent the div so it looks like it starts right where the query starts (instead of starting where the line starts)
    widget.setAttribute("style", `margin-left: ${this.indent * 0.5}rem;`);

    // Since the top-most element has to be `display: block`, it will stretch to fill the entire line
    // We want to add a click listener, so attaching it to this outside div will make it so clicking anywhere on the line executes the query
    // To avoid this, we create a child button and add the `innerText` and the click handler to it instead
    const button = document.createElement("button");
    button.innerText = "▶ Run Query";
    button.setAttribute("class", "cm-run-query-button");
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
 * Given an EditorState & a set of `PrismaClientQuery`s, returns decorations that must be drawn for them
 */
export function getDecorations(
  state: EditorState,
  queries: PrismaQuery[]
): RangeSet<Decoration> {
  let decorations: RangeSet<Decoration> = RangeSet.empty;

  queries.forEach(query => {
    const lineStart = state.doc.lineAt(query.from);
    const lineEnd = state.doc.lineAt(query.to);

    // Add line decorations for each line this query exists in
    decorations = decorations.update({
      add: new Array(lineEnd.number - lineStart.number + 1)
        .fill(undefined)
        .map((_, i) => {
          const line = state.doc.line(lineStart.number + i);
          return {
            from: line.from,
            to: line.from, // Line decorations must start and end on the same line
            value: Decoration.line({
              attributes: { class: "cm-query" },
            }),
          };
        }),
      sort: true,
    });

    // Add a widget decoration to be able to run this query
    decorations = decorations.update({
      add: [
        {
          from: lineStart.from,
          to: lineStart.from,
          value: Decoration.widget({
            widget: new RunQueryWidget({
              query,
              indent: lineStart.text.length - lineStart.text.trim().length,
              onExecute: state.facet(OnExecuteFacet),
            }),
            side: -1,
          }),
        },
      ],
      sort: true,
    });
  });

  return decorations;
}
