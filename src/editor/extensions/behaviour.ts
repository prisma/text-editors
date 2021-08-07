import { closeBrackets } from "@codemirror/closebrackets";
import { codeFolding, foldGutter } from "@codemirror/fold";
import {
  gutter,
  highlightActiveLineGutter,
  lineNumbers,
} from "@codemirror/gutter";
import { history } from "@codemirror/history";
import { indentOnInput } from "@codemirror/language";
import { bracketMatching } from "@codemirror/matchbrackets";
import { EditorState, Extension } from "@codemirror/state";
import { OnChange, onChangeCallback } from "./change-callback";

export const behaviour = (config: { onChange?: OnChange }): Extension => [
  EditorState.tabSize.of(2),
  bracketMatching(),
  closeBrackets(),
  indentOnInput(),
  codeFolding(),

  gutter({}),
  highlightActiveLineGutter(),
  foldGutter({
    markerDOM: isOpen => {
      // Feathericons: chevron-down
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "2");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");

      const polyline = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polyline"
      );
      polyline.setAttribute("points", "6 9 12 15 18 9");

      svg.appendChild(polyline);

      svg.classList.add("cm-foldMarker");
      if (!isOpen) {
        svg.classList.add("folded");
      }

      return svg as any;
    },
  }),
  lineNumbers(),

  history(),
  onChangeCallback(config.onChange),
];
