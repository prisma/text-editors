import { highlightSpecialChars } from "@codemirror/view";
import {
  classHighlightStyle,
  defaultHighlightStyle,
} from "@codemirror/highlight";

export function useEditorAppearance() {
  return [classHighlightStyle, defaultHighlightStyle, highlightSpecialChars()];
}
