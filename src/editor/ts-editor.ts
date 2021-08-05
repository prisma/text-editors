import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { logger } from "../logger";
import { behaviour } from "./extensions/behaviour";
import { keymap } from "./extensions/keymap";
import { prismaQuery } from "./extensions/prisma-query";
import { setTheme, theme, ThemeName } from "./extensions/theme";
import { FileMap, injectTypes, typescript } from "./extensions/typescript";

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
  private view: EditorView;

  constructor(params: EditorParams) {
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

          theme(params.theme || "light"),
          behaviour({ onChange: params.onChange }),
          keymap(),
        ],
      }),
    });

    log("Initialized");
  }

  public injectTypes = (types: FileMap) => {
    this.view.dispatch(injectTypes(types));
  };

  public setTheme(theme: ThemeName) {
    this.view.dispatch(setTheme(theme));
  }

  public forceUpdate = (code: string) => {
    log("Force updating editor value");

    this.view.dispatch({
      changes: [
        { from: 0, to: this.view.state.doc.length },
        { from: 0, insert: code },
      ],
    });
  };

  public destroy = () => {
    // This is an arrow function because we want to inherit the `this` binding
    this.view.destroy();
  };
}
