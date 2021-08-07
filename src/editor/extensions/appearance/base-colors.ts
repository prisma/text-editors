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
