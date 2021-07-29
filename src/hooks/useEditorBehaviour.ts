import { closeBrackets } from "@codemirror/closebrackets";
import { foldGutter } from "@codemirror/fold";
import { gutter, lineNumbers } from "@codemirror/gutter";
import { history } from "@codemirror/history";
import { indentOnInput } from "@codemirror/language";
import { bracketMatching } from "@codemirror/matchbrackets";

export function useEditorBehaviour() {
  return [
    bracketMatching(),
    closeBrackets(),
    foldGutter(),
    gutter({}),
    indentOnInput(),
    lineNumbers(),
    history(),
  ];
}
