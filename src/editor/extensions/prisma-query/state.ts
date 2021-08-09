import { RangeSet } from "@codemirror/rangeset";
import { Extension, Facet, StateField } from "@codemirror/state";
import { noop, over } from "lodash-es";
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
export function state(config: { onExecute?: OnExecute }): Extension {
  return [OnExecuteFacet.of(config.onExecute || noop), prismaQueryStateField];
}
