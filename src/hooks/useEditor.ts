import { useEffect } from "react";

import { EditorState } from "@codemirror/state";
import { EditorView, highlightSpecialChars, keymap } from "@codemirror/view";
import { defaultKeymap, defaultTabBinding } from "@codemirror/commands";
import { autocompletion, completionKeymap } from "@codemirror/autocomplete";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/closebrackets";
import { commentKeymap } from "@codemirror/comment";
import { foldGutter, foldKeymap } from "@codemirror/fold";
import { gutter, lineNumbers } from "@codemirror/gutter";
import {
  classHighlightStyle,
  defaultHighlightStyle,
} from "@codemirror/highlight";
import { history, undo } from "@codemirror/history";
import { indentOnInput } from "@codemirror/language";
import { lintKeymap } from "@codemirror/lint";
import { bracketMatching } from "@codemirror/matchbrackets";
import { javascript } from "@codemirror/lang-javascript";

export function useEditor(code: string) {
  useEffect(() => {
    const view = new EditorView({
      parent: document.querySelector("#editor")!,
      state: EditorState.create({
        doc: code,

        extensions: [
          // Code
          autocompletion({
            override: [
              ctx => {
                return null;
              },
            ],
          }),
          bracketMatching(),
          closeBrackets(),
          foldGutter(),
          gutter({}),
          indentOnInput(),
          lineNumbers(),

          // Syntax Highlighting
          classHighlightStyle,
          defaultHighlightStyle,
          highlightSpecialChars(),
          javascript({ typescript: true }),

          // Keymaps
          keymap.of([
            defaultTabBinding,
            ...defaultKeymap,
            ...closeBracketsKeymap,
            ...commentKeymap,
            ...completionKeymap,
            ...foldKeymap,
            ...lintKeymap,
            {
              key: "Ctrl-z",
              mac: "Mod-z",
              run: undo,
            },
          ]),

          history(),
        ],
      }),
    });

    return () => {
      view.destroy();
    };
  });
}
