import { EditorView } from "@codemirror/view";
import throttle from "lodash/throttle";
import {
  setDimensions,
  setHighlightStyle,
  setTheme,
  ThemeName,
} from "../extensions/appearance";
import { logger } from "../logger";

const log = logger("base-editor", "black");

type BaseEditorParams = {
  domElement: Element;
};

export abstract class BaseEditor {
  private domElement: Element;
  protected abstract view: EditorView;

  constructor(params: BaseEditorParams) {
    this.domElement = params.domElement;

    const onResizeThrottled = throttle(this.setDimensions, 50);
    window.addEventListener("resize", onResizeThrottled);
  }

  public get state() {
    return this.view.state;
  }

  public setDimensions = () => {
    const dimensions = this.domElement.getBoundingClientRect();
    this.view.dispatch(setDimensions(dimensions.width, dimensions.height));
  };

  public setTheme = (theme?: ThemeName) => {
    this.view.dispatch(setTheme(theme));
    this.view.dispatch(setHighlightStyle(theme));
  };

  public forceUpdate = (code: string = "") => {
    log("Force updating", { code });
    this.view.dispatch({
      changes: [
        { from: 0, to: this.state.doc.length },
        { from: 0, insert: code },
      ],
    });
  };

  public destroy = () => {
    this.view.destroy();
  };
}
