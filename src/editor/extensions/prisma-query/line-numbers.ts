import { gutter, GutterMarker } from "@codemirror/gutter";
import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { OnExecuteFacet, prismaQueryStateField } from "./state";

/**
 * A GutterMarker that shows line numbers
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
 * A GutterMarker that shows a "run query" button
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
    gutter({
      lineMarker: (view, line, others) => {
        return new LineNumberMarker(view.state.doc.lineAt(line.from).number);
      },
    }),
  ];
}
