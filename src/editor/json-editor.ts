import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { logger } from "../logger";
import { BaseEditor } from "./base-editor";
import { appearance, ThemeName } from "./extensions/appearance";
import { behaviour } from "./extensions/behaviour";
import { keymap } from "./extensions/keymap";

const log = logger("json-editor", "salmon");

type JSONEditorParams = {
  domElement: Element;
  code: string;
  readonly?: boolean;
  theme?: ThemeName;
  onChange?: (value: string) => void;
};

export class JSONEditor extends BaseEditor {
  protected view: EditorView;

  constructor(params: JSONEditorParams) {
    super(params);

    const { width, height } = params.domElement.getBoundingClientRect();

    this.view = new EditorView({
      parent: params.domElement,
      state: EditorState.create({
        doc: params.code,

        extensions: [
          EditorView.editable.of(!params.readonly),
          json(),
          linter(jsonParseLinter()),

          appearance({ theme: params.theme, width, height }),
          behaviour({ onChange: params.onChange }),
          keymap(),
        ],
      }),
    });

    log("Initialized");
  }
}
