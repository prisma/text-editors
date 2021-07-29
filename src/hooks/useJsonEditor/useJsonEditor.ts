import { useEffect } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, highlightSpecialChars, keymap } from "@codemirror/view";
import { defaultKeymap, defaultTabBinding } from "@codemirror/commands";
import { completionKeymap } from "@codemirror/autocomplete";
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
import { bracketMatching } from "@codemirror/matchbrackets";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter } from "@codemirror/lint";

import { log } from "./log";
import { useEditorTheme } from "../useEditorTheme";

type EditorParams = {
  code: string;
  readonly?: boolean;
};

export function useJsonEditor(domSelector: string, params: EditorParams) {
  const parent = document.querySelector(domSelector)!;
  while (parent.firstChild) parent.removeChild(parent.firstChild); // Empty out parent
  const dimensions = parent.getBoundingClientRect();
  const editorTheme = useEditorTheme(dimensions);

  useEffect(() => {
    const view = new EditorView({
      parent,
      dispatch: transaction => {
        if (params.readonly && transaction.docChanged) {
          return;
        }

        // Update view first
        view.update([transaction]);
      },
      state: EditorState.create({
        doc: params.code,

        extensions: [
          // Language
          json(),
          linter(jsonParseLinter()),

          // Appearance
          editorTheme,
          classHighlightStyle,
          defaultHighlightStyle,
          highlightSpecialChars(),

          // Behaviour
          bracketMatching(),
          closeBrackets(),
          foldGutter(),
          gutter({}),
          indentOnInput(),
          lineNumbers(),
          history(),

          // Keymap
          keymap.of([
            defaultTabBinding,
            ...defaultKeymap,
            ...closeBracketsKeymap,
            ...commentKeymap,
            ...completionKeymap,
            ...foldKeymap,
            {
              key: "Ctrl-z",
              mac: "Mod-z",
              run: undo,
            },
            {
              key: "Ctrl-Enter",
              mac: "Mod-Enter",
              run: ({ state }) => {
                log("Running query", state.doc);
                return true;
              },
            },
          ]),
        ],
      }),
    });

    log("Initialized");

    return () => {
      view.destroy();
    };
  });
}
