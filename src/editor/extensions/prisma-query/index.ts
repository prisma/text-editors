import { RangeSet } from "@codemirror/rangeset";
import { EditorState, Extension, Facet, StateField } from "@codemirror/state";
import { Decoration, EditorView, keymap } from "@codemirror/view";
import { noop, over } from "lodash-es";
import { getDecorations } from "./get-decorations";
import { getQueries, PrismaQuery } from "./get-queries";
import { log } from "./log";

/**
 * This file exports an extension that makes Prisma Query functionality work. This includes:
 *
 * 1. A StateField that will hold positions and values of PrismaClient queries, as well as decorations attached to them
 * 2. A line Decoration that will add a special class to all lines in view that are known to contain PrismaClient queries (as stored in the StateField)
 * 3. A widget Decoration that will add a DOM element on the first line where a query is known to exist (as stored in the StateField)
 * 4. A Facet that will be used to register one or more `onExecute` handler. This facet's value will be accessible by the StateField
 * 5. A keyMap that will be used to execute the query your cursor is on when you press a combination of keys
 *
 * The "correct" way to read this file is from bottom to top.
 */

/**
 * State field that tracks which ranges are PrismaClient queries, and decorations associated with them
 */
type PrismaQueries = {
  queries: PrismaQuery[];
  decorations: RangeSet<Decoration>;
};
const prismaQueryStateField = StateField.define<PrismaQueries>({
  create(state) {
    const queries = getQueries(state);

    return {
      queries,
      decorations: getDecorations(state, queries),
    };
  },

  update(value, transaction) {
    value.decorations = value.decorations.map(transaction.changes);

    if (transaction.docChanged) {
      const state = transaction.state;
      const queries = getQueries(transaction.state);
      return { queries, decorations: getDecorations(state, queries) };
    }

    return value;
  },

  provide: field =>
    EditorView.decorations.compute(
      [field],
      state => state.field(field).decorations
    ),
});

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

const runQuery = (state: EditorState) => {
  const onExecute = state.facet(OnExecuteFacet);
  const cursors = state.selection.ranges.filter(r => r.empty);
  const firstCursor = cursors[0];

  if (!firstCursor) {
    log("Unable to find cursors, bailing");
    return true;
  }

  const relevantQuery = state
    .field(prismaQueryStateField)
    .queries.find(q => firstCursor.from >= q.from && firstCursor.to <= q.to);

  if (!relevantQuery) {
    log("Unable to find relevant query, bailing");
    return true;
  }

  log("Running query", relevantQuery.text);
  onExecute(relevantQuery.text);
};

// Export a function that will build & return an Extension
export function prismaQuery(config: { onExecute?: OnExecute }): Extension {
  return [
    OnExecuteFacet.of(config.onExecute || noop),
    prismaQueryStateField,
    keymap.of([
      {
        key: "Ctrl-Enter",
        mac: "Mod-Enter",
        run: ({ state }) => {
          runQuery(state);

          return true;
        },
      },
    ]),
  ];
}
