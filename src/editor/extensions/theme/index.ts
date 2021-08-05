import { Compartment, Extension, TransactionSpec } from "@codemirror/state";
import { highlightActiveLine, highlightSpecialChars } from "@codemirror/view";
import { theme as darkTheme } from "./dark";
import { theme as lightTheme } from "./light";

export type ThemeName = "light" | "dark";

const themeCompartment = new Compartment();

const getTheme = (themeName: ThemeName): Extension => {
  if (themeName === "light") {
    return lightTheme;
  } else {
    return darkTheme;
  }
};

export const setTheme = (theme: ThemeName): TransactionSpec => {
  return {
    effects: themeCompartment.reconfigure(getTheme(theme)),
  };
};

export const theme = (theme: ThemeName): Extension => {
  return [
    themeCompartment.of(getTheme(theme)),
    highlightSpecialChars(),
    highlightActiveLine(),
  ];
};
