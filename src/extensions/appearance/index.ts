import { Compartment, Extension, TransactionSpec } from "@codemirror/state";
import {
  EditorView,
  highlightActiveLine,
  highlightSpecialChars,
} from "@codemirror/view";
import merge from "lodash/merge";
import {
  highlightStyle as darkHighlightStyle,
  theme as darkTheme,
} from "./dark-colors";
import {
  highlightStyle as lightHighlightStyle,
  theme as lightTheme,
} from "./light-colors";

export type ThemeName = "light" | "dark";
export type HighlightStyle = "light" | "dark" | "none";

const dimensionsCompartment = new Compartment();
const themeCompartment = new Compartment();
const highlightStyleCompartment = new Compartment();

const getThemeExtension = (t: ThemeName): Extension => {
  if (t === "light") {
    return lightTheme;
  } else {
    return darkTheme;
  }
};

const getHighlightStyleExtension = (h: HighlightStyle): Extension => {
  if (h === "light") {
    return lightHighlightStyle;
  } else if (h === "dark") {
    return darkHighlightStyle;
  } else {
    return [];
  }
};

export const setTheme = (theme: ThemeName): TransactionSpec => {
  return {
    effects: themeCompartment.reconfigure(getThemeExtension(theme)),
  };
};

export const setHighlightStyle = (
  highlightStyle: HighlightStyle
): TransactionSpec => {
  return {
    effects: highlightStyleCompartment.reconfigure(
      getHighlightStyleExtension(highlightStyle)
    ),
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
  domElement,
  theme,
  highlightStyle,
}: {
  domElement?: Element;
  theme?: ThemeName;
  highlightStyle?: HighlightStyle;
}): Extension => {
  const { width, height } = merge(
    { width: 300, height: 300 },
    domElement?.getBoundingClientRect()
  );

  return [
    dimensionsCompartment.of(
      EditorView.editorAttributes.of({
        style: `width: ${width || 300}px; height: ${height || 300}px`,
      })
    ),
    themeCompartment.of(getThemeExtension(theme || "light")),
    highlightStyleCompartment.of(
      getHighlightStyleExtension(highlightStyle || theme || "light")
    ),
    highlightSpecialChars(),
    highlightActiveLine(),
  ];
};
