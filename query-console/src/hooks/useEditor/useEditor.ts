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

import { useTypescript } from "../useTypescript/useTypescript";
import { lineAndColumnFromPos } from "./lineAndColumnFromPos";
import { log } from "./log";

export function useEditor(domSelector: string, code: string) {
  const ts = useTypescript(code);

  useEffect(() => {
    const view = new EditorView({
      parent: document.querySelector(domSelector)!,
      dispatch: transaction => {
        view.update([transaction]);
        // TODO:: Send messages to ts to keep it in sync with editor content here
        transaction.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
          const { line, column } = lineAndColumnFromPos(
            transaction.state,
            fromA
          );

          log(line, column);
        });
      },
      state: EditorState.create({
        doc: code,

        extensions: [
          // Code
          autocompletion({
            activateOnTyping: true,
            override: [
              async ctx => {
                const { line, column } = lineAndColumnFromPos(
                  ctx.state,
                  ctx.pos
                );

                console.log(ctx.pos, line, column);

                // await ts.updateOpen(code);
                // const completions = await ts.getCompletions(line, column);

                // return {
                //   from: ctx.pos,
                //   options:
                //     completions.body?.map(c => ({
                //       type: "property", // TODO:: Return correct `type`
                //       label: c.name,
                //       info:
                //         c.displayParts.map(p => p.text).join("") +
                //         (c.documentation || ""),
                //     })) || [],
                // };

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
            {
              key: "Ctrl-Enter",
              mac: "Mod-Enter",
              run: ({ state, dispatch }) => {
                console.log("ss", state.doc);
                return true;
              },
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
