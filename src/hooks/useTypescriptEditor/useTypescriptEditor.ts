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
import { linter } from "@codemirror/lint";
import { bracketMatching } from "@codemirror/matchbrackets";
import { javascript } from "@codemirror/lang-javascript";

import { log } from "./log";
import { useTypescript } from "../useTypescript/useTypescript";
import { useDebounce } from "../useDebounce";
import { useEditorTheme } from "../useEditorTheme";

type EditorParams = {
  code: string;
  readonly?: boolean;
};

export function useTypescriptEditor(domSelector: string, params: EditorParams) {
  const ts = useTypescript(params.code);
  const updateFileDebounced = useDebounce((content: string) => {
    if (!ts) {
      log("ts is not initialized, skipping updateFile");
      return null;
    }

    log("Commit file change");
    ts.updateFile("index.ts", content);
  }, 300);

  const parent = document.querySelector(domSelector)!;
  while (parent.firstChild) parent.removeChild(parent.firstChild); // Empty out parent
  const dimensions = parent.getBoundingClientRect();
  const editorTheme = useEditorTheme(dimensions);

  useEffect(() => {
    if (!ts) {
      log("ts is not initialized, deferring editor loading");
      return;
    }

    const view = new EditorView({
      parent,
      dispatch: transaction => {
        if (params.readonly && transaction.docChanged) {
          return;
        }

        // Update view first
        view.update([transaction]);

        // Then tell tsserver about new file (on a debounce to avoid ddos-ing it)
        if (transaction.docChanged) {
          updateFileDebounced(transaction.newDoc.sliceString(0));
        }
      },
      state: EditorState.create({
        doc: params.code,

        extensions: [
          // Language
          javascript({ typescript: true }),
          autocompletion({
            activateOnTyping: true,
            override: [
              async ctx => {
                const completions = ts.languageService.getCompletionsAtPosition(
                  "index.ts",
                  ctx.pos,
                  {}
                );
                if (!completions) {
                  log("Unable to get completions", { pos: ctx.pos });
                  return null;
                }

                return {
                  from: ctx.pos,
                  options:
                    completions.entries.map(c => ({
                      type: "property", // TODO:: Return correct `type`
                      label: c.name,
                      // info:
                      //   c.displayParts.map(p => p.text).join("") +
                      //   (c.documentation || ""),
                    })) || [],
                };
              },
            ],
          }),
          linter(() =>
            ts.languageService.getSemanticDiagnostics("index.ts").map(d => ({
              from: d.start || 0,
              to: (d.start || 0) + (d.length || 0),
              severity: "error",
              message: d.messageText as string,
            }))
          ),

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
  }, [ts]);
}
