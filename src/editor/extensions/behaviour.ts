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
    // markerDOM: isOpen => {
    //   const marker = document.createElement("div");
    //   marker.innerText = "F";
    //   return marker;
    // },
  }),
  lineNumbers(),

  history(),
  onChangeCallback(config.onChange),
];
