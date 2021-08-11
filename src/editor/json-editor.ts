import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { appearance, ThemeName } from "../extensions/appearance";
import { behaviour } from "../extensions/behaviour";
import { keymap } from "../extensions/keymap";
import { logger } from "../logger";
import { BaseEditor } from "./base-editor";

const log = logger("json-editor", "salmon");

type JSONEditorParams = {
  domElement: Element;
  code?: string;
  readonly?: boolean;
  theme?: ThemeName;
  onChange?: (value: string) => void;
};

export class JSONEditor extends BaseEditor {
  protected view: EditorView;

  /**
   * Returns a state-only version of the editor, without mounting the actual view anywhere. Useful for testing.
   */
  static state(params: JSONEditorParams) {
    const { width, height } = params.domElement?.getBoundingClientRect();
    return EditorState.create({
      doc: params.code,

      extensions: [
        EditorView.editable.of(!params.readonly),
        json(),
        linter(jsonParseLinter()),

        appearance({ theme: params.theme, width, height }),
        behaviour({ onChange: params.onChange }),
        keymap(),
      ],
    });
  }

  constructor(params: JSONEditorParams) {
    super(params);

    this.view = new EditorView({
      parent: params.domElement,
      state: JSONEditor.state(params),
    });

    log("Initialized");
  }
}
