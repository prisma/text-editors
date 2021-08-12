import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { appearance, ThemeName } from "../extensions/appearance";
import { behaviour } from "../extensions/behaviour";
import { keymap } from "../extensions/keymap";
import { logger } from "../logger";
import { BaseEditor } from "./base-editor";

const log = logger("prisma-schema-editor", "salmon");

type PrismaSchemaEditorParams = {
  domElement: Element;
  code?: string;
  readonly?: boolean;
  theme?: ThemeName;
  onChange?: (value: string) => void;
};

export class PrismaSchemaEditor extends BaseEditor {
  protected view: EditorView;

  /**
   * Returns a state-only version of the editor, without mounting the actual view anywhere. Useful for testing.
   */
  static state(params: PrismaSchemaEditorParams) {
    return EditorState.create({
      doc: params.code || "",

      extensions: [
        EditorView.editable.of(!params.readonly),

        appearance({ domElement: params.domElement, theme: params.theme }),
        behaviour({ onChange: params.onChange }),
        keymap(),
      ],
    });
  }

  constructor(params: PrismaSchemaEditorParams) {
    super(params);

    this.view = new EditorView({
      parent: params.domElement,
      state: PrismaSchemaEditor.state(params),
    });

    log("Initialized");
  }
}
