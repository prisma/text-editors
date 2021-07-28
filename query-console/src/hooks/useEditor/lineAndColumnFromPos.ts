import { EditorState } from "@codemirror/state";

/** Takes a (CodeMirror) editor position and returns the line and column number */
export function lineAndColumnFromPos(state: EditorState, pos: number) {
  const line = state.doc.lineAt(pos);
  const column = pos - line.from;

  return { line: line.number, column };
}
