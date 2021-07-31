import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { useEffect } from "react";
import { logger } from "../logger";
import { useEditorBehaviour } from "./useEditorBehaviour";
import { useEditorKeymap } from "./useEditorKeymap";
import { useEditorParent } from "./useEditorParent";
import { ThemeName, useEditorTheme } from "./useEditorTheme";

const log = logger("json-editor", "salmon");

type EditorParams = {
  code: string;
  readonly?: boolean;
  theme?: ThemeName;
  onChange?: (value: string) => void;
  onExecuteQuery?: (value: string) => void;
};

/**
 * Creates a CodeMirror instance for editing JSON
 *
 * @param domSelector DOM Element where the editor will be rendered
 * @param params Editor configuration
 */
export function useJsonEditor(domSelector: string, params: EditorParams) {
  const { parent, dimensions } = useEditorParent(domSelector);
  const editorThemeExtensions = useEditorTheme(
    (params.theme = "dark"),
    dimensions
  );
  const behaviourExtensions = useEditorBehaviour();
  const keyMapExtensions = useEditorKeymap();

  useEffect(() => {
    const view = new EditorView({
      parent,
      dispatch: transaction => {
        view.update([transaction]);

        if (transaction.docChanged) {
          params.onChange?.(transaction.newDoc.sliceString(0));
        }
      },
      state: EditorState.create({
        doc: params.code,

        extensions: [
          EditorView.editable.of(!params.readonly),
          json(),
          linter(jsonParseLinter()),

          editorThemeExtensions,
          behaviourExtensions,
          keyMapExtensions,
        ],
      }),
    });

    log("Initialized");

    return () => {
      view.destroy();
    };
  });
}
