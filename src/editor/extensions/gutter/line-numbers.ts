import { RangeSet } from "@codemirror/rangeset";
import { Extension } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { logger } from "../../../logger";

const log = logger("line-numbers-extension", "bisque");

/** A Widget that displays a line number */
class LineNumberWidget extends WidgetType {
  private text: number;

  constructor(text: number) {
    super();
    this.text = text;
  }

  ignoreEvent() {
    return false;
  }

  eq(other: LineNumberWidget) {
    return this.text === other.text;
  }

  toDOM = () => {
    const widget = document.createElement("div");
    widget.setAttribute(
      "style",
      "display: inline-block; text-align: right; min-width: 30px; margin-right: 8px;"
    );
    widget.setAttribute("class", "cm-gutterElement");
    widget.innerText = `${this.text}`;

    return widget;
  };
}

/**
 * A View plugin that draws the LineNumber Widgets
 */
type Line = { from: number; number: number };
const lineNumbersPlugin = ViewPlugin.fromClass(
  class {
    lines: Line[];

    constructor(view: EditorView) {
      this.lines = this.getLines(view);
    }

    update(viewUpdate: ViewUpdate) {
      if (viewUpdate.viewportChanged) {
        this.lines = this.getLines(viewUpdate.view);
      }
    }

    private getLines(view: EditorView) {
      let lines: Line[] = [];
      view.viewportLines(line => {
        lines.push({
          from: line.from,
          number: view.state.doc.lineAt(line.from).number,
        });
      }, 0);
      return lines;
    }
  },
  {
    decorations: value => {
      const decorations = RangeSet.empty;

      return decorations.update({
        add: value.lines.map(l => {
          return {
            from: l.from,
            to: l.from,
            value: Decoration.widget({
              widget: new LineNumberWidget(l.number),
              side: -1,
            }),
          };
        }),
      });
    },
  }
);

export const lineNumbers = (): Extension => {
  return [lineNumbersPlugin];
};
