import { Extension } from "@codemirror/state";
import {
  oneDarkHighlightStyle,
  oneDarkTheme,
} from "@codemirror/theme-one-dark";
import { base } from "./base-colors";

export const theme = [base, oneDarkTheme];

export const highlightStyle: Extension = [oneDarkHighlightStyle];
