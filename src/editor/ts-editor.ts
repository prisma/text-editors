import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { appearance, setTheme, ThemeName } from "../extensions/appearance";
import { behaviour } from "../extensions/behaviour";
import { keymap as defaultKeymap } from "../extensions/keymap";
import * as PrismaQuery from "../extensions/prisma-query";
import {
  FileMap,
  injectTypes,
  setDiagnostics,
  typescript,
} from "../extensions/typescript";
import { logger } from "../logger";
import { BaseEditor } from "./base-editor";

const log = logger("ts-editor", "limegreen");

type TSEditorParams = {
  domElement: Element;
  code?: string;
  readonly?: boolean;
  types?: FileMap;
  theme?: ThemeName;
  onChange?: (value: string) => void;
  onExecuteQuery?: (query: string) => void;
};

export class TSEditor extends BaseEditor {
  protected view: EditorView;

  /**
   * Returns a state-only version of the editor, without mounting the actual view anywhere. Useful for testing.
   */
  static state(params: TSEditorParams) {
    return EditorState.create({
      doc: params.code || "",

      extensions: [
        EditorView.editable.of(!params.readonly),

        appearance({
          domElement: params.domElement,
          theme: params.theme,
          highlightStyle: "none", // We'll let the prismaQuery extension handle the highlightStyle
        }),

        PrismaQuery.gutter(),
        behaviour({
          lineNumbers: false, // We'll let the prismaQuery extension handle line numbers
          onChange: params.onChange,
        }),
        defaultKeymap(),
        PrismaQuery.lineNumbers(),

        typescript(),
        PrismaQuery.state({ onExecute: params.onExecuteQuery }),
        PrismaQuery.highlightStyle(),
        PrismaQuery.keymap(),
      ],
    });
  }

  constructor(params: TSEditorParams) {
    super(params);

    this.view = new EditorView({
      parent: params.domElement,
      state: TSEditor.state(params),
    });

    log("Initialized");
  }

  /** @override */
  public setTheme = (theme?: ThemeName) => {
    // Override the `setTheme` method to make sure `highlightStyle` never changes from "none"
    this.view.dispatch(setTheme(theme));
  };

  public injectTypes = async (types: FileMap) => {
    this.view.dispatch(injectTypes(types));
    this.view.dispatch(await setDiagnostics(this.view.state));
  };
}
