import {
  classHighlightStyle,
  defaultHighlightStyle,
} from "@codemirror/highlight";
import { Extension } from "@codemirror/state";
import {
  oneDarkHighlightStyle,
  oneDarkTheme,
} from "@codemirror/theme-one-dark";
import { EditorView, highlightSpecialChars } from "@codemirror/view";

export type ThemeName = "light" | "dark";

export function useEditorTheme(
  name: ThemeName,
  dimensions?: DOMRect
): Extension[] {
  const height = dimensions?.height || 100;

  const extensions = [
    EditorView.theme(
      {
        "&": { height: height + "px", width: "100%" },
        ".cm-scroller": { overflow: "auto" },
      },
      {
        dark: name === "dark",
      }
    ),
    classHighlightStyle,
    highlightSpecialChars(),
  ];

  if (name === "light") {
    extensions.push(defaultHighlightStyle);
  }

  if (name === "dark") {
    extensions.push(oneDarkTheme);
    extensions.push(oneDarkHighlightStyle);
  }

  return extensions;
}
