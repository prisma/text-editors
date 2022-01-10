import {
  EditorSelection,
  EditorState,
  Extension,
  SelectionRange,
} from "@codemirror/state";
import { expect, test } from "@playwright/test";
import {
  findFirstCursor,
  isCursorInRange,
} from "../src/extensions/prisma-query/find-cursor";

function editorState(extensions: Extension = []) {
  return EditorState.create({
    extensions,
  });
}

test.describe.parallel("findFirstCursor", () => {
  test("can find cursor when there is none", () => {
    const state = EditorState.create();
    const cursor = findFirstCursor(state);

    expect(cursor).not.toBe(null);
    expect(cursor).toHaveProperty("pos", 0);
  });

  test("can find cursor when there is one", () => {
    const state = EditorState.create({
      doc: "Some text",
      selection: EditorSelection.cursor(4),
    });
    const cursor = findFirstCursor(state);

    expect(cursor).not.toBe(null);
    expect(cursor).toHaveProperty("pos", 4);
  });

  test("can find cursor when there are multiple", () => {
    // Multiple selection ranges are unsupported
    const state = EditorState.create({
      doc: "Some text",
      extensions: [EditorState.allowMultipleSelections.of(true)],
      selection: EditorSelection.create([
        SelectionRange.fromJSON({
          anchor: 5,
          head: 5,
        }),
        SelectionRange.fromJSON({
          anchor: 4,
          head: 4,
        }),
      ]),
    });
    const cursor = findFirstCursor(state);

    expect(cursor).not.toBe(null);
    // Ranges will be sorted internally
    // Last selection is considered
    // Selection heads are treated as cursors
    expect(cursor).toHaveProperty("pos", 5);
  });

  test("can find cursor when there is a selection range only", () => {
    const state = EditorState.create({
      doc: "Some text",
      extensions: [EditorState.allowMultipleSelections.of(true)],
      selection: EditorSelection.create([
        SelectionRange.fromJSON({
          anchor: 5,
          head: 7,
        }),
      ]),
    });
    const cursor = findFirstCursor(state);

    expect(cursor).not.toBe(null);
    expect(cursor).toHaveProperty("pos", 7);
  });

  test("can find cursor when there are multiple selection ranges", () => {
    // Multiple selection ranges are unsupported
    const state = EditorState.create({
      doc: "Some text",
      extensions: [EditorState.allowMultipleSelections.of(true)],
      selection: EditorSelection.create([
        SelectionRange.fromJSON({
          anchor: 5,
          head: 7,
        }),
        SelectionRange.fromJSON({
          anchor: 0,
          head: 4,
        }),
      ]),
    });
    const cursor = findFirstCursor(state);

    expect(cursor).not.toBe(null);
    // Ranges will be sorted internally
    // Last selection is considered
    // Selection heads are treated as cursors
    expect(cursor).toHaveProperty("pos", 7);
  });
});

test.describe("isCursorInRange", () => {
  test("works when there is no cursor", () => {
    const state = editorState();
    const isInRange = isCursorInRange(state, 0, 0);
  });
  test("works when there is one cursor", () => {});
  test("works when there are multiple cursors", () => {});
  test("works when there is a selection range only", () => {});
  test("works when there are multiple selection ranges", () => {});
});
