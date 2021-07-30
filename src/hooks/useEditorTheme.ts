import {
  classHighlightStyle,
  defaultHighlightStyle,
} from "@codemirror/highlight";
import { Extension } from "@codemirror/state";
import {
  oneDarkHighlightStyle,
  oneDarkTheme,
} from "@codemirror/theme-one-dark";
import {
  EditorView,
  highlightActiveLine,
  highlightSpecialChars,
} from "@codemirror/view";

export type ThemeName = "light" | "dark";

export function useEditorTheme(
  name: ThemeName,
  dimensions?: DOMRect
): Extension {
  const height = dimensions?.height || 100;

  const extensions = [
    EditorView.theme(
      {
        "&": { height: height + "px", width: "100%" },
        ".cm-scroller": { overflow: "auto" },
        ".cm-activeLine": { background: "#fff1" },
        ".cm-query": { background: "#000" },
      },
      {
        dark: name === "dark",
      }
    ),
    classHighlightStyle,
    highlightSpecialChars(),
    highlightActiveLine(),

    // Light theme-specific extensions
    name === "light" ? defaultHighlightStyle : [],

    // Dark theme-specific extensions
    name === "dark" ? oneDarkTheme : [],
    name === "dark" ? oneDarkHighlightStyle : [],
  ];

  return extensions;
}
