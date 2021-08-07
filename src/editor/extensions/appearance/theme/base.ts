import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

export const base: Extension = [
  EditorView.theme({
    "&": {
      fontSize: "14px",
    },
    ".cm-scroller": { overflow: "auto" },
    ".cm-gutters": { border: "none" },
    ".cm-foldPlaceholder": { background: "transparent", border: "none" },

    // Prisma Query Plugin
    ".cm-query": {
      height: "100%",
      borderLeft: "3px solid #22C55E" /* green-500 */,
    },
    ".cm-run-query-button": {
      background: "transparent",
      border: 0,
      color: "#00000055",
      cursor: "pointer",
      fontSize: "13px",
      fontFamily: "monospace",

      "&:hover": {
        color: "#00000088",
      },
    },

    // Autocomplete
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
    ".cm-autocompleteIcon-var": {},
    ".cm-autocompleteIcon-let": {},
    ".cm-autocompleteIcon-const": {},

    ".cm-autocompleteIcon-class": {},
    ".cm-autocompleteIcon-constructor": {},
    ".cm-autocompleteIcon-function": {},
    ".cm-autocompleteIcon-method": {},
    ".cm-autocompleteIcon-parameter": {},
    ".cm-autocompleteIcon-property": {},

    ".cm-autocompleteIcon-type": {},
    ".cm-autocompleteIcon-interface": {},
    ".cm-autocompleteIcon-enum": {},
    ".cm-autocompleteIcon-enum-member": {},
    ".cm-autocompleteIcon-keyword": {},
    ".cm-autocompleteIcon-string": {},

    // Diagnostics (Lint issues) & Quickinfo (Hover tooltips)
    ".cm-diagnostic, .cm-quickinfo-tooltip": {
      padding: "0.5rem",
      fontFamily: "monospace",
    },
  }),
];
