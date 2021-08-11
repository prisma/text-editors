import { closeBrackets } from "@codemirror/closebrackets";
import { codeFolding, foldGutter } from "@codemirror/fold";
import {
  highlightActiveLineGutter,
  lineNumbers as lineNumbersGutter,
} from "@codemirror/gutter";
import { history } from "@codemirror/history";
import { indentOnInput } from "@codemirror/language";
import { bracketMatching } from "@codemirror/matchbrackets";
import { EditorState, Extension } from "@codemirror/state";
import merge from "lodash-es/merge";
import { OnChange, onChangeCallback } from "./change-callback";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

/**
 * Convenient bag of useful extensions that control behaviour
 */
export const behaviour = (config: {
  lineNumbers?: boolean;
  onChange?: OnChange;
}): Extension => {
  config = merge({ lineNumbers: true }, config);

  return [
    EditorState.tabSize.of(2),
    bracketMatching(),
    closeBrackets(),
    indentOnInput(),
    codeFolding(),

    highlightActiveLineGutter(),
    foldGutter({
      markerDOM: isOpen => {
        // Feathericons: chevron-down
        const svg = document.createElementNS(SVG_NAMESPACE, "svg");
        svg.setAttribute("xmlns", SVG_NAMESPACE);
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "none");
        svg.setAttribute("stroke", "currentColor");
        svg.setAttribute("stroke-width", "2");
        svg.setAttribute("stroke-linecap", "round");
        svg.setAttribute("stroke-linejoin", "round");

        const polyline = document.createElementNS(SVG_NAMESPACE, "polyline");
        polyline.setAttribute("points", "6 9 12 15 18 9");

        svg.appendChild(polyline);

        svg.classList.add("cm-foldMarker");
        if (!isOpen) {
          svg.classList.add("folded");
        }

        return svg as any;
      },
    }),
    [config.lineNumbers ? lineNumbersGutter({}) : []],

    history(),
    onChangeCallback(config.onChange),
  ];
};
