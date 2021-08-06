import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { logger } from "../logger";
import { BaseEditor } from "./base-editor";
import { appearance, ThemeName } from "./extensions/appearance";
import { behaviour } from "./extensions/behaviour";
import { keymap } from "./extensions/keymap";

const log = logger("prisma-schema-editor", "salmon");

type PrismaSchemaEditorParams = {
  domElement: Element;
  code: string;
  readonly?: boolean;
  theme?: ThemeName;
  onChange?: (value: string) => void;
};

export class PrismaSchemaEditor extends BaseEditor {
  protected view: EditorView;

  constructor(params: PrismaSchemaEditorParams) {
    super(params);

    const { width, height } = params.domElement.getBoundingClientRect();

    this.view = new EditorView({
      parent: params.domElement,
      state: EditorState.create({
        doc: params.code,

        extensions: [
          EditorView.editable.of(!params.readonly),

          appearance({ theme: params.theme, width, height }),
          behaviour({ onChange: params.onChange }),
          keymap(),
        ],
      }),
    });

    log("Initialized");
  }
}
