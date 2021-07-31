import { autocompletion } from "@codemirror/autocomplete";
import { javascript } from "@codemirror/lang-javascript";
import { Diagnostic, linter } from "@codemirror/lint";
import { EditorState, Text } from "@codemirror/state";
import { hoverTooltip } from "@codemirror/tooltip";
import { EditorView, keymap } from "@codemirror/view";
import { debounce } from "lodash-es";
import { useEffect } from "react";
import { DiagnosticCategory, DiagnosticMessageChain } from "typescript";
import { useEditorBehaviour } from "../useEditorBehaviour";
import { useEditorKeymap } from "../useEditorKeymap";
import { useEditorParent } from "../useEditorParent";
import { ThemeName, useEditorTheme } from "../useEditorTheme";
import { FileMap, useTypescript } from "../useTypescript/useTypescript";
import { prismaClientQueries } from "./highlightQueries";
import { log } from "./log";

export type { FileMap };

type EditorParams = {
  code: string;
  readonly?: boolean;
  types?: FileMap;
  theme?: ThemeName;
  onChange?: (value: string) => void;
  onExecuteQuery?: (value: string) => void;
};

/**
 * Creates a CodeMirror instance for editing TypeScript
 *
 * @param domSelector DOM Element where the editor will be rendered
 * @param params Editor configuration
 */
export function useTypescriptEditor(domSelector: string, params: EditorParams) {
  const ts = useTypescript(params.code, params.types);
  const onChangeDebounced = debounce((doc: Text) => {
    const content = doc.sliceString(0);
    params.onChange?.(content);

    if (!ts) {
      log("ts is not initialized, skipping updateFile");
      return null;
    }

    log("Commit file change");
    ts.updateFile("index.ts", content);
  }, 100);

  const { parent, dimensions } = useEditorParent(domSelector);
  const editorThemeExtensions = useEditorTheme(
    params.theme || "dark",
    dimensions
  );
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
        // Update view first
        view.update([transaction]);

        // Then tell tsserver about new file (on a debounce to avoid ddos-ing it)
        if (transaction.docChanged) {
          onChangeDebounced(transaction.newDoc);
        }
      },
      state: EditorState.create({
        doc: params.code,

        extensions: [
          EditorView.editable.of(!params.readonly),
          javascript({ typescript: true, jsx: false }),
          autocompletion({
            activateOnTyping: true,
            override: [
              async ctx => {
                log("Autocomplete requested", { pos: ctx.pos });

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
          linter(view => {
            const diagnostics =
              ts.languageService.getSemanticDiagnostics("index.ts");

            return diagnostics
              .map(d => {
                if (!d.start || !d.length) {
                  return;
                }

                let severity: "info" | "warning" | "error" = "info";
                if (d.category === DiagnosticCategory.Error) {
                  severity = "error";
                } else if (d.category === DiagnosticCategory.Warning) {
                  severity = "warning";
                }

                let message = d.messageText;
                if (typeof message !== "string") {
                  // Messages can be a linked list (in case of cascading type errors). In that case, stringify them
                  let composedMessage = "";
                  function depthFirstFlatten(
                    m: DiagnosticMessageChain,
                    depth: number = 0
                  ) {
                    composedMessage += Array.from({ length: depth })
                      .fill("  ")
                      .join("");
                    composedMessage += m.messageText;
                    composedMessage += "\n";
                    m.next?.forEach(n => depthFirstFlatten(n, depth + 1));
                  }

                  depthFirstFlatten(message);
                  message = composedMessage;
                }

                return {
                  from: d.start,
                  to: d.start + d.length,
                  severity,
                  message,
                };
              })
              .filter((d): d is Diagnostic => !!d);
          }),
          hoverTooltip(
            (view, pos, side) => {
              const quickInfo = ts.languageService.getQuickInfoAtPosition(
                "index.ts",
                pos
              );
              if (!quickInfo) {
                return null;
              }

              return {
                pos,
                create(view) {
                  const dom = document.createElement("div");
                  dom.innerText =
                    quickInfo.displayParts?.map(d => d.text).join("") || "";
                  dom.setAttribute(
                    "style",
                    "padding: 10px; font-family: monospace;"
                  );

                  return {
                    dom,
                  };
                },
                above: false, // HACK: This makes it so lint errors show up on TOP of this, so BOTH quickInfo and lint tooltips don't show up at the same time
              };
            },
            { hideOnChange: true }
          ),

          editorThemeExtensions,
          behaviourExtensions,
          keyMapExtensions,

          prismaClientQueries,

          keymap.of([
            {
              key: "Ctrl-Enter",
              mac: "Mod-Enter",
              run: ({ state }) => {
                if (!params.onExecuteQuery) {
                  return false;
                }

                const cursors = state.selection.ranges.filter(r => r.empty);
                const firstCursor = cursors[0];

                if (!firstCursor) {
                  log("Unable to find cursors, bailing");
                  return true;
                }

                const queries = state.field(prismaClientQueries);

                const relevantQuery = queries.queries.find(
                  q => firstCursor.from >= q.from && firstCursor.to <= q.to
                );

                if (!relevantQuery) {
                  log("Unable to find relevant query, bailing");
                  return true;
                }

                log("Running query", relevantQuery.text);
                params.onExecuteQuery(relevantQuery.text);

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
