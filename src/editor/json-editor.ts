import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { logger } from "../logger";
import { behaviourExtension } from "./extensions/behaviour";
import { keymapExtension } from "./extensions/keymap";
import { theme, ThemeName } from "./extensions/theme";

const log = logger("json-editor", "salmon");

type EditorParams = {
  domElement: Element;
  code: string;
  readonly?: boolean;
  theme?: ThemeName;
  onChange?: (value: string) => void;
};

export class Editor {
  private view: EditorView;

  constructor(params: EditorParams) {
    this.view = new EditorView({
      parent: params.domElement,
      dispatch: transaction => {
        // Update view first
        this.view.update([transaction]);

        // Then tell tsserver about new file (on a debounce to avoid ddos-ing it)
        if (transaction.docChanged) {
          params.onChange?.(transaction.newDoc.sliceString(0));
        }
      },
      state: EditorState.create({
        doc: params.code,

        extensions: [
          EditorView.editable.of(!params.readonly),
          json(),
          linter(jsonParseLinter()),

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

  public destroy() {
    this.view.destroy();
  }
}
