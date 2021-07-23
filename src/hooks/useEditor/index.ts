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

export function useEditor(domSelector: string, code: string) {
  useEffect(() => {
    const tsserver = useTSServer(code);
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
            override: [
              async ctx => {
                const line = ctx.state.doc.lineAt(ctx.pos);
                const firstCursor = ctx.state.selection.ranges.filter(
                  r => r.empty
                )[0];
                const columnNumber = firstCursor.head - line.from;

                const completions = await tsserver.getCompletions(
                  "index.ts",
                  line.number,
                  columnNumber
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
