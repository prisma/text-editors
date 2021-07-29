import { EditorView } from "@codemirror/view";

export function useEditorTheme(dimensions: DOMRect) {
  return EditorView.theme({
    "&": { height: dimensions.height + "px", width: "100%" },
    ".cm-scroller": { overflow: "auto" },
  });
}
