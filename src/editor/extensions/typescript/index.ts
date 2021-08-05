import {
  autocompletion,
  completeFromList,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import { javascript } from "@codemirror/lang-javascript";
import { Diagnostic, linter, setDiagnostics } from "@codemirror/lint";
import {
  Extension,
  StateEffect,
  StateField,
  TransactionSpec,
} from "@codemirror/state";
import { hoverTooltip, Tooltip } from "@codemirror/tooltip";
import { EditorView } from "@codemirror/view";
import { debounce } from "lodash-es";
import {
  DiagnosticCategory,
  displayPartsToString,
  flattenDiagnosticMessageText,
} from "typescript";
import { log } from "./log";
import { FileMap, TypescriptProject } from "./project";

export { TypescriptProject };
export type { FileMap };

/**
 * This file exports an extension that makes Typescript language services work. This includes:
 *
 * 1. A StateField, that holds an instance of a `TypescriptProject`
 * 2. A `javascript` extension, that provides syntax highlighting and other simple JS features.
 * 3. A `autocomplete` extension that provides tsserver-backed completions, powered by the `completionSource` function
 * 4. A `linter` extension that provides tsserver-backed type errors, powered by the `lintDiagnostics` function
 * 5. A `hoverTooltip` extension that provides tsserver-type information on hover, powered by the `hoverTooltip` function
 * 6. An `updateListener` (facet) extension, that ensures that the editor's view is kept in sync with tsserver's view of the file
 * 7. A StateEffect that lets a consumer inject custom types into the `TypescriptProject`
 *
 * The "correct" way to read this file is from bottom to top.
 */

/**
 * An EditorState field that represents the Typescript project that is currently "open" in the EditorView
 */
const tsStateField = StateField.define<TypescriptProject>({
  create(state) {
    // Get value from facet
    return new TypescriptProject(state.sliceDoc(0));
  },

  update(ts, transaction) {
    // For all transactions that run, this state field's value will only "change" if a `injectTypesEffect` StateEffect is attache to the transaction
    transaction.effects.forEach(e => {
      if (e.is(injectTypesEffect)) {
        ts.injectTypes(e.value);
      }
    });

    return ts;
  },

  compare() {
    // There must never be two instances of this state field
    return true;
  },
});

const completionSource = async (
  ctx: CompletionContext
): Promise<CompletionResult | null> => {
  const { state, pos } = ctx;

  const ts = state.field(tsStateField);
  const completions = (await ts.lang()).getCompletionsAtPosition(
    ts.entrypoint,
    pos,
    {}
  );
  if (!completions) {
    log("Unable to get completions", { pos });
    return null;
  }

  return completeFromList(
    completions.entries.map(c => ({
      type: c.kind,
      label: c.name,
      detail: "detail",
      info: "info",
      // boost: 1 / distance(c.name, "con"),
    }))
  )(ctx);
};

const lintDiagnostics = async (view: EditorView): Promise<Diagnostic[]> => {
  const ts = view.state.field(tsStateField);
  const diagnostics = (await ts.lang()).getSemanticDiagnostics(ts.entrypoint);

  return diagnostics
    .filter(d => d.start !== undefined && d.length !== undefined)
    .map(d => {
      let severity: "info" | "warning" | "error" = "info";
      if (d.category === DiagnosticCategory.Error) {
        severity = "error";
      } else if (d.category === DiagnosticCategory.Warning) {
        severity = "warning";
      }

      return {
        from: d.start!, // `!` is fine because of the `.filter()` before the `.map()`
        to: d.start! + d.length!, // `!` is fine because of the `.filter()` before the `.map()`
        severity,
        message: flattenDiagnosticMessageText(d.messageText, "\n", 0),
      };
    });
};

const hoverTooltipSource = async (
  view: EditorView,
  pos: number
): Promise<Tooltip | null> => {
  const ts = view.state.field(tsStateField);
  const quickInfo = (await ts.lang()).getQuickInfoAtPosition(
    ts.entrypoint,
    pos
  );
  if (!quickInfo) {
    return null;
  }

  return {
    pos,
    create() {
      const dom = document.createElement("div");
      dom.innerText = displayPartsToString(quickInfo.displayParts);
      if (quickInfo.documentation?.length)
        dom.innerText += "\n" + displayPartsToString(quickInfo.documentation);
      dom.setAttribute("class", "cm-quickinfo-tooltip");

      return {
        dom,
      };
    },
    above: false, // HACK: This makes it so lint errors show up on TOP of this, so BOTH quickInfo and lint tooltips don't show up at the same time
  };
};

const updateTSFileDebounced = debounce((view: EditorView) => {
  const ts = view.state.field(tsStateField);
  const doc = view.state.doc;
  const content = doc.sliceString(0);
  log("TODO:: Register onChange as a facet and call it");
  // params.onChange?.(content);

  log("Commit file change");
  // Don't `await` because we do not want to block
  ts.env().then(env => env.updateFile(ts.entrypoint, content));
}, 100);

const injectTypesEffect = StateEffect.define<FileMap>();
export function injectTypes(types: FileMap): TransactionSpec {
  return {
    effects: [injectTypesEffect.of(types)],
  };
}

export function typescript(config: {
  code: string;
  onChange?: (value: string) => void;
}): Extension {
  return [
    tsStateField,
    javascript({ typescript: true, jsx: false }),
    autocompletion({
      activateOnTyping: true,
      maxRenderedOptions: 50,
      override: [completionSource],
    }),
    linter(lintDiagnostics),
    hoverTooltip(hoverTooltipSource, {
      hideOnChange: true,
    }),
    EditorView.updateListener.of(({ view, docChanged }) => {
      if (docChanged) {
        // Update TSServer's view of this file
        updateTSFileDebounced(view);

        // Then re-compute lint diagnostics
        lintDiagnostics(view).then(diagnostics => {
          view.dispatch(setDiagnostics(view.state, diagnostics));
        });
      }
    }),
  ];
}
