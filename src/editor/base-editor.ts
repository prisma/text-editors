import { EditorView } from "@codemirror/view";
import { throttle } from "lodash-es";
import { setDimensions, setTheme, ThemeName } from "./extensions/appearance";

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

  protected setDimensions = () => {
    const dimensions = this.domElement.getBoundingClientRect();
    this.view.dispatch(setDimensions(dimensions.width, dimensions.height));
  };

  public setTheme = (theme: ThemeName) => {
    this.view.dispatch(setTheme(theme));
  };

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
