import { EditorState, Extension } from "@codemirror/state";
import { keymap as keymapFacet } from "@codemirror/view";
import { findFirstCursor } from "./find-cursor";
import { log } from "./log";
import { OnExecuteFacet, prismaQueryStateField } from "./state";

export function runQueryUnderCursor(state: EditorState) {
  const onExecute = state.facet(OnExecuteFacet);
  if (!onExecute) {
    log("No OnExecute facet value found, bailing");
    return false;
  }

  const firstCursor = findFirstCursor(state);
  if (!firstCursor) {
    log("Unable to find cursors, bailing");
    return true;
  }

  let query: string | null = null;
  state
    .field(prismaQueryStateField)
    .between(firstCursor.pos, firstCursor.pos, (from, to, q) => {
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
}

/**
 * Shortcuts relating to the Prisma Query extension
 */
export function keymap(): Extension {
  return [
    keymapFacet.of([
      {
        key: "Ctrl-Enter",
        mac: "Mod-Enter",
        run: ({ state }) => {
          runQueryUnderCursor(state);
          return true;
        },
      },
    ]),
  ];
}
