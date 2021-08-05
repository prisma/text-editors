import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { logger } from "../logger";
import { behaviour } from "./extensions/behaviour";
import { keymap } from "./extensions/keymap";
import { setTheme, theme, ThemeName } from "./extensions/theme";

const log = logger("prisma-schema-editor", "salmon");

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
      state: EditorState.create({
        doc: params.code,

        extensions: [
          EditorView.editable.of(!params.readonly),

          theme(params.theme || "light"),
          behaviour({ onChange: params.onChange }),
          keymap(),
        ],
      }),
    });

    log("Initialized");
  }

  public setTheme(theme: ThemeName) {
    this.view.dispatch(setTheme(theme));
  }

  public forceUpdate = (code: string) => {
    this.view.dispatch({
      changes: [
        { from: 0, to: this.view.state.doc.length },
        { from: 0, insert: code },
      ],
    });
  };

  public destroy = () => {
    this.view.destroy();
  };
}
