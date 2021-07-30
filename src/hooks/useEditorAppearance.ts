import {
  classHighlightStyle,
  defaultHighlightStyle,
} from "@codemirror/highlight";
import { highlightSpecialChars } from "@codemirror/view";

export function useEditorAppearance() {
  return [classHighlightStyle, defaultHighlightStyle, highlightSpecialChars()];
}
