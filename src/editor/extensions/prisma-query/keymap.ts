import { Extension } from "@codemirror/state";
import { keymap as keymapFacet } from "@codemirror/view";
import { log } from "./log";
import { OnExecuteFacet, prismaQueryStateField } from "./state";

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
