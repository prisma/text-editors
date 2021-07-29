import { EditorView } from "@codemirror/view";

export function useEditorTheme(dimensions?: DOMRect) {
  const height = dimensions?.height || 100;

  return EditorView.theme({
    "&": { height: height + "px", width: "100%" },
    ".cm-scroller": { overflow: "auto" },
  });
}
