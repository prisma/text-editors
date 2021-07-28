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
import { lintKeymap, linter } from "@codemirror/lint";
import { bracketMatching } from "@codemirror/matchbrackets";
import { javascript } from "@codemirror/lang-javascript";
import { sql } from "@codemirror/lang-sql";
import { json } from "@codemirror/lang-json";

import { useTypescript } from "../useTypescript/useTypescript";
import { log } from "./log";
import { useDebounce } from "../useDebounce";

export type EditorMode = "typescript" | "sql" | "json";
type EditorParams = {
  mode: EditorMode;
  code: string;
};

export function useEditor(domSelector: string, params: EditorParams) {
  const ts = useTypescript(params.code);
  const updateFileDebounced = useDebounce((content: string) => {
    if (!ts) {
      log("ts is not initialized, skipping updateFile");
      return null;
    }

    log("Commit file change");
    ts.updateFile("index.ts", content);
  }, 300);

  useEffect(() => {
    const parent = document.querySelector(domSelector)!;
    while (parent.firstChild) parent.removeChild(parent.firstChild); // Empty out parent

    const dimensions = parent.getBoundingClientRect();

    const view = new EditorView({
      parent,
      dispatch: transaction => {
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
          ...(params.mode === "typescript"
            ? [
                javascript({ typescript: true }),
                autocompletion({
                  activateOnTyping: true,
                  override: [
                    async ctx => {
                      if (!ts) {
                        log("ts is not initialized, skipping autocomplete");
                        return null;
                      }

                      const completions =
                        ts.languageService.getCompletionsAtPosition(
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
                linter(() => {
                  if (!ts) {
                    log("ts is not initialized, skipping lint");
                    return [];
                  }

                  return ts.languageService
                    .getSemanticDiagnostics("index.ts")
                    .map(d => ({
                      from: d.start || 0,
                      to: (d.start || 0) + (d.length || 0),
                      severity: "error",
                      message: d.messageText as string,
                    }));
                }),
              ]
            : []),
          ...(params.mode === "sql" ? [sql()] : []),
          ...(params.mode === "json" ? [json()] : []),

          // Appearance
          EditorView.theme({
            "&": { height: dimensions.height + "px", width: "100%" },
            ".cm-scroller": { overflow: "auto" },
          }),
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
            ...lintKeymap,
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

    return () => {
      view.destroy();
    };
  });
}
