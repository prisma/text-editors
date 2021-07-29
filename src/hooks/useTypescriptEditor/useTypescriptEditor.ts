import { useEffect } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { autocompletion } from "@codemirror/autocomplete";
import { linter } from "@codemirror/lint";
import { javascript } from "@codemirror/lang-javascript";
import { debounce } from "lodash-es";

import { log } from "./log";
import { useTypescript } from "../useTypescript/useTypescript";
import { useEditorParent } from "../useEditorParent";
import { useEditorTheme } from "../useEditorTheme";
import { useEditorAppearance } from "../useEditorAppearance";
import { useEditorBehaviour } from "../useEditorBehaviour";
import { useEditorKeymap } from "../useEditorKeymap";

type EditorParams = {
  code: string;
  readonly?: boolean;
};

export function useTypescriptEditor(domSelector: string, params: EditorParams) {
  const ts = useTypescript(params.code);
  const updateFileDebounced = debounce((content: string) => {
    if (!ts) {
      log("ts is not initialized, skipping updateFile");
      return null;
    }

    log("Commit file change");
    ts.updateFile("index.ts", content);
  }, 300);

  const { parent, dimensions } = useEditorParent(domSelector);
  const editorTheme = useEditorTheme(dimensions);

  const appearanceExtensions = useEditorAppearance();
  const behaviourExtensions = useEditorBehaviour();
  const keyMapExtensions = useEditorKeymap();

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

          editorTheme,
          ...appearanceExtensions,
          ...behaviourExtensions,
          ...keyMapExtensions,

          keymap.of([
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
