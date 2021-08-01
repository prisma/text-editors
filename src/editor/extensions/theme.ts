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
          padding: "0.5rem",
          fontFamily: "monospace",
        },

        ".cm-tooltip": {
          background: "#363636",
          fontFamily: "monospace",
        },

        ".cm-tooltip-autocomplete": {},
        ".cm-completionLabel": {}, // Unmatched text
        ".cm-completionMatchedText": {
          textDecoration: "none",
          fontWeight: 600,
          color: "#00B4D4",
        },
        ".cm-completionDetail": {
          fontStyle: "initial",
          color: "#ABABAB",
          marginLeft: "2rem",
        }, // Text to the right of tooltip
        ".cm-completionInfo": {}, // "Additional" text that shows up in a panel on the right of the tolltip

        ".cm-autocompleteIcon": {},
        ".cm-autocompleteIcon-var": {
          "&:after": { content: '"V"' },
        },
        ".cm-autocompleteIcon-let": {},
        ".cm-autocompleteIcon-const": {},

        ".cm-autocompleteIcon-class": {},
        ".cm-autocompleteIcon-constructor": {},
        ".cm-autocompleteIcon-function": {
          "&:after": { content: '"F"' },
        },
        ".cm-autocompleteIcon-method": {},
        ".cm-autocompleteIcon-parameter": {},
        ".cm-autocompleteIcon-property": {},

        ".cm-autocompleteIcon-type": {},
        ".cm-autocompleteIcon-interface": {},
        ".cm-autocompleteIcon-enum": {},
        ".cm-autocompleteIcon-enum-member": {},
        ".cm-autocompleteIcon-keyword": {},
        ".cm-autocompleteIcon-string": {},
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
