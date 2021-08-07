import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { logger } from "../logger";
import { BaseEditor } from "./base-editor";
import { appearance, setTheme, ThemeName } from "./extensions/appearance";
import { behaviour } from "./extensions/behaviour";
import { keymap } from "./extensions/keymap";
import { prismaQuery } from "./extensions/prisma-query";
import { FileMap, injectTypes, typescript } from "./extensions/typescript";

const log = logger("ts-editor", "limegreen");

type TSEditorParams = {
  domElement: Element;
  code: string;
  readonly?: boolean;
  types?: FileMap;
  theme?: ThemeName;
  onChange?: (value: string) => void;
  onExecuteQuery?: (query: string) => void;
};

export class TSEditor extends BaseEditor {
  protected view: EditorView;

  constructor(params: TSEditorParams) {
    super(params);

    const { width, height } = params.domElement.getBoundingClientRect();

    this.view = new EditorView({
      parent: params.domElement,
      state: EditorState.create({
        doc: params.code,

        extensions: [
          EditorView.editable.of(!params.readonly),

          typescript({
            code: params.code,
          }),
          prismaQuery({ onExecute: params.onExecuteQuery }),

          appearance({
            theme: params.theme,
            highlightStyle: "none", // We'll let the prismaQuery extension handle the highlightStyle
            width,
            height,
          }),
          behaviour({ onChange: params.onChange }),
          keymap(),
        ],
      }),
    });

    log("Initialized");
  }

  /** @override */
  public setTheme = (theme: ThemeName) => {
    // Override the `setTheme` method to make sure `highlightStyle` never changes from "none"
    this.view.dispatch(setTheme(theme));
  };

  public injectTypes = (types: FileMap) => {
    this.view.dispatch(injectTypes(types));
  };
}
