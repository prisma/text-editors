import { Compartment, Extension, TransactionSpec } from "@codemirror/state";
import {
  EditorView,
  highlightActiveLine,
  highlightSpecialChars,
} from "@codemirror/view";
import { theme as darkTheme } from "./theme/dark";
import { theme as lightTheme } from "./theme/light";

export type ThemeName = "light" | "dark";

const themeCompartment = new Compartment();
const dimensionsCompartment = new Compartment();

const getThemeExtension = (themeName: ThemeName): Extension => {
  if (themeName === "light") {
    return lightTheme;
  } else {
    return darkTheme;
  }
};

export const setTheme = (theme: ThemeName): TransactionSpec => {
  return {
    effects: themeCompartment.reconfigure(getThemeExtension(theme)),
  };
};
export const setDimensions = (
  width: number,
  height: number
): TransactionSpec => {
  return {
    effects: dimensionsCompartment.reconfigure(
      EditorView.editorAttributes.of({
        style: `width: ${width || 300}px; height: ${height || 300}px`,
      })
    ),
  };
};

export const appearance = ({
  theme,
  width,
  height,
}: {
  theme?: ThemeName;
  width?: number;
  height?: number;
}): Extension => {
  return [
    dimensionsCompartment.of(
      EditorView.editorAttributes.of({
        style: `width: ${width || 300}px; height: ${height || 300}px`,
      })
    ),
    themeCompartment.of(getThemeExtension(theme || "light")),
    highlightSpecialChars(),
    highlightActiveLine(),
  ];
};
