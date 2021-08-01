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

export function theme(name: ThemeName, dimensions?: DOMRect): Extension {
  const height = dimensions?.height || 100;

  const extensions = [
    EditorView.theme(
      {
        "&": { height: height + "px", width: "100%", fontSize: "14px" },
        ".cm-scroller": { overflow: "auto" },
        ".cm-activeLine": { background: "#0002" },
        ".cm-query": {
          background: "#00000033",
          borderLeft: "3px solid #3fe288",
        },
        ".cm-gutters": {
          background: "#1e222a",
          borderRight: "1px solid #3c4048",
        },
        ".cm-diagnostic": {
          padding: "10px",
          fontFamily: "monospace",
        },
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
