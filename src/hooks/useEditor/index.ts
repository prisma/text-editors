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

import { useTSServer } from "../useTSServer";
import { lineAndColumnFromPos } from "./lineAndColumnFromPos";
import { log } from "./log";

export function useEditor(domSelector: string, code: string) {
  const tsserver = useTSServer(code);

  useEffect(() => {
    const view = new EditorView({
      parent: document.querySelector(domSelector)!,
      dispatch: transaction => {
        view.update([transaction]);
        // TODO:: Send messages to tsserver to keep it in sync with editor content here
        // console.log(transaction.changes);
      },
      state: EditorState.create({
        doc: code,

        extensions: [
          // Code
          autocompletion({
            activateOnTyping: false,
            override: [
              async ctx => {
                const { line, column } = lineAndColumnFromPos(
                  ctx.state,
                  ctx.pos
                );

                await tsserver.updateOpen(code);
                const completions = await tsserver.getCompletions(
                  line.number,
                  column
                );

                return {
                  from: line.from,
                  options:
                    completions.body?.map(c => ({
                      type: c.kind, // TSServer `kind`s match up with CodeMirror `type`s
                      label: c.name,
                      info: c.displayParts.map(p => p.text).join(""),
                    })) || [],
                };
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
