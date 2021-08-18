import { RangeSet } from "@codemirror/rangeset";
import { Extension, Facet, StateField } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import noop from "lodash/noop";
import over from "lodash/over";
import { findFirstCursor } from "./find-cursor";
import { findQueries, PrismaQuery } from "./find-queries";

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
 * Facet to allow configuring query enter callback
 */
export type OnEnterQuery = (query: string) => void;
export const OnEnterQueryFacet = Facet.define<OnEnterQuery, OnEnterQuery>({
  combine: input => {
    // If multiple `onEnterQuery` callbacks are registered, chain them (call them one after another)
    return over(input);
  },
});

/**
 * Facet to allow configuring query leave callback
 */
export type OnLeaveQuery = () => void;
export const OnLeaveQueryFacet = Facet.define<OnLeaveQuery, OnLeaveQuery>({
  combine: input => {
    // If multiple `onLeaveQuery` callbacks are registered, chain them (call them one after another)
    return over(input);
  },
});

/**
 * State field that tracks which ranges are PrismaClient queries.
 * We don't store a DecorationSet directly in the StateField because we need to be able to find the `text` of a query
 */
export const prismaQueryStateField = StateField.define<RangeSet<PrismaQuery>>({
  create(state) {
    return findQueries(state);
  },

  update(value, transaction) {
    if (transaction.docChanged) {
      return findQueries(transaction.state);
    }

    return value;
  },
});

/**
 * An extension that enables Prisma Client Query tracking
 */
export function state(config: {
  onExecute?: OnExecute;
  onEnterQuery?: OnEnterQuery;
  onLeaveQuery?: OnLeaveQuery;
}): Extension {
  return [
    OnExecuteFacet.of(config.onExecute || noop),
    OnEnterQueryFacet.of(config.onEnterQuery || noop),
    OnLeaveQueryFacet.of(config.onLeaveQuery || noop),
    prismaQueryStateField,
    EditorView.updateListener.of(({ view, docChanged }) => {
      const onEnterQuery = view.state.facet(OnEnterQueryFacet);
      const onLeaveQuery = view.state.facet(OnLeaveQueryFacet);

      const cursor = findFirstCursor(view.state);
      const line = view.state.doc.lineAt(cursor.pos);

      let lineHasQuery = false;
      view.state
        .field(prismaQueryStateField)
        .between(line.from, line.to, (from, to, value) => {
          lineHasQuery = true;
          onEnterQuery(value.text);
        });

      if (!lineHasQuery) {
        onLeaveQuery();
      }
    }),
  ];
}
