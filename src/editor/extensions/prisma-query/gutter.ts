import { gutter as cmGutter, GutterMarker } from "@codemirror/gutter";
import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { prismaQueryStateField } from "./state";

/**
 * invisible = there's no Prisma query on this line
 * inactive = there's a Prisma query on this line, but your cursor is not on it
 * active = there's a Prisma query on this line, and your cursor is on it
 */
type QueryGutterType = "invisible" | "inactive" | "active";

/**
 * A GutterMarker that marks lines that have valid PrismaClient queries
 */
class QueryGutterMarker extends GutterMarker {
  type: QueryGutterType;

  constructor(type: QueryGutterType) {
    super();
    this.type = type;
  }

  toDOM() {
    const div = document.createElement("div");
    div.classList.add("cm-prismaQuery");
    div.classList.add(this.type);

    return div;
  }
}

export function gutter(): Extension {
  return [
    cmGutter({
      /**
       * Add a line marker that adds a green, grey or transparent line to the gutter:
       *
       * 1. An invisible line if this line is not part of a Prisma query
       * 2. A grey line if this line is part of a Prisma Query, but your cursor is not on it
       * 3. A green line if this line is part of a Prisma Query, and your cursor is on it
       */
      lineMarker: (view, line) => {
        const cursors = view.state.selection.ranges;
        const cursor = cursors[0];

        // If (beginning of) selection range (aka the cursor) is inside the query, add (visible) markers for all lines in query (and invisible ones for others)
        // Toggling between visible/invisible instead of adding/removing markers makes it so the editor does not jump when a marker is shown as your cursor moves around
        let marker: QueryGutterMarker = new QueryGutterMarker("invisible");
        view.state
          .field(prismaQueryStateField)
          .between(line.from, line.to, (from, to) => {
            marker = new QueryGutterMarker("inactive");
            if (cursor?.from >= from && cursor?.from <= to) {
              marker = new QueryGutterMarker("active");
            }
          });

        return marker;
      },
    }),
    // Gutter line marker styles
    EditorView.baseTheme({
      ".cm-gutterElement .cm-prismaQuery": {
        height: "100%",

        "&.invisible": {
          borderLeft: "3px solid transparent",
        },
        "&.inactive": {
          borderLeft: "3px solid #E2E8F0" /* blueGray-200 */,
        },
        "&.active": {
          borderLeft: "3px solid #22C55E" /* green-500 */,
        },
      },
    }),
  ];
}
