import {
  autocompletion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import { javascript } from "@codemirror/lang-javascript";
import { Diagnostic, linter, setDiagnostics } from "@codemirror/lint";
import { EditorState, Text } from "@codemirror/state";
import { hoverTooltip, Tooltip } from "@codemirror/tooltip";
import { EditorView } from "@codemirror/view";
import { debounce } from "lodash-es";
import { DiagnosticCategory, DiagnosticMessageChain } from "typescript";
import { logger } from "../logger";
import { FileMap, TypescriptProject } from "../typescript";
import { behaviourExtension } from "./extensions/behaviour";
import { keymapExtension } from "./extensions/keymap";
import { prismaQuery } from "./extensions/prisma-query";
import { theme, ThemeName } from "./extensions/theme";

const log = logger("ts-editor", "limegreen");

type EditorParams = {
  domElement: Element;
  code: string;
  readonly?: boolean;
  types?: FileMap;
  theme?: ThemeName;
  onChange?: (value: string) => void;
  onExecuteQuery?: (query: string) => void;
};

export class Editor {
  private ts: TypescriptProject;
  private view: EditorView;

  constructor(params: EditorParams) {
    const onChangeDebounced = debounce(async (doc: Text) => {
      const content = doc.sliceString(0);
      params.onChange?.(content);

      log("Commit file change");
      // Don't `await` because we do not want to block
      this.ts.env().then(env => {
        env.updateFile(this.ts.entrypoint, content);
      });
    }, 100);

    this.ts = new TypescriptProject(params.code);

    this.view = new EditorView({
      parent: params.domElement,
      dispatch: transaction => {
        // Update view first
        this.view.update([transaction]);

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
            override: [this.getCompletionSource],
          }),
          linter(this.getLintDiagnostics),
          hoverTooltip(this.getHoverTooltipSource, { hideOnChange: true }),
          prismaQuery({ onExecute: params.onExecuteQuery }),

          theme(
            params.theme || "dark",
            params.domElement.getBoundingClientRect()
          ),
          behaviourExtension,
          keymapExtension,
        ],
      }),
    });

    log("Initialized");
  }

  private getCompletionSource = async (
    ctx: CompletionContext
  ): Promise<CompletionResult | null> => {
    // This is an arrow function because we want to inherit the `this` binding

    const completions = (await this.ts.lang()).getCompletionsAtPosition(
      this.ts.entrypoint,
      ctx.pos,
      {
        disableSuggestions: true,
      }
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
  };

  private getLintDiagnostics = async (): Promise<Diagnostic[]> => {
    // This is an arrow function because we want to inherit the `this` binding
    const diagnostics = (await this.ts.lang()).getSemanticDiagnostics(
      this.ts.entrypoint
    );

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
  };

  private getHoverTooltipSource = async (
    _view: EditorView,
    pos: number
  ): Promise<Tooltip | null> => {
    // This is an arrow function because we want to inherit the `this` binding

    const quickInfo = (await this.ts.lang()).getQuickInfoAtPosition(
      this.ts.entrypoint,
      pos
    );
    if (!quickInfo) {
      return null;
    }

    return {
      pos,
      create() {
        const dom = document.createElement("div");
        dom.innerText = quickInfo.displayParts?.map(d => d.text).join("") || "";
        dom.setAttribute("style", "padding: 10px; font-family: monospace;");

        return {
          dom,
        };
      },
      above: false, // HACK: This makes it so lint errors show up on TOP of this, so BOTH quickInfo and lint tooltips don't show up at the same time
    };
  };

  public injectTypes = (types: FileMap) => {
    // This is an arrow function because we want to inherit the `this` binding

    this.ts.injectTypes(types || {});

    // Don't `await`, we do not want this function's caller to wait
    this.getLintDiagnostics().then(diagnostics => {
      this.view.dispatch(setDiagnostics(this.view.state, diagnostics));
    });
  };

  public forceUpdate = (code: string) => {
    this.view.dispatch({
      changes: [
        { from: 0, to: this.view.state.doc.length },
        { from: 0, insert: code },
      ],
    });

    // Don't `await`, we do not want this function's caller to wait

    // Update TSServer's view of this file
    this.ts.env().then(env => env.updateFile(this.ts.entrypoint, code));

    // Then re-compute lint diagnostics
    this.getLintDiagnostics().then(diagnostics => {
      this.view.dispatch(setDiagnostics(this.view.state, diagnostics));
    });
  };

  public destroy = () => {
    // This is an arrow function because we want to inherit the `this` binding

    this.ts.destroy();
    this.view.destroy();
  };
}
