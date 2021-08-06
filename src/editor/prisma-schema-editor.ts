import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { debounce } from "lodash-es";
import { logger } from "../logger";
import {
  appearance,
  setDimensions,
  setTheme,
  ThemeName,
} from "./extensions/appearance";
import { behaviour } from "./extensions/behaviour";
import { keymap } from "./extensions/keymap";

const log = logger("prisma-schema-editor", "salmon");

type EditorParams = {
  domElement: Element;
  code: string;
  readonly?: boolean;
  theme?: ThemeName;
  onChange?: (value: string) => void;
};

export class Editor {
  private domElement: Element;
  private view: EditorView;

  constructor(params: EditorParams) {
    const { width, height } = params.domElement.getBoundingClientRect();

    this.domElement = params.domElement;
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

    const onResizeDebounced = debounce(this.setDimensions, 2000);
    window.addEventListener("resize", onResizeDebounced);
  }

  private setDimensions = () => {
    const dimensions = this.domElement.getBoundingClientRect();
    this.view.dispatch(setDimensions(dimensions.width, dimensions.height));
  };

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
