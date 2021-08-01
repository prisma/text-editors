import { sql } from "@codemirror/lang-sql";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { useEffect } from "react";
import { useEditorBehaviour } from "../editor/extensions/behaviour";
import { useEditorKeymap } from "../editor/extensions/keymap";
import { ThemeName, useEditorTheme } from "../editor/extensions/theme";
import { logger } from "../logger";
import { useEditorParent } from "./useEditorParent";

const log = logger("sql-editor", "aquamarine");

type EditorParams = {
  code: string;
  readonly?: boolean;
  theme?: ThemeName;
  onChange?: (value: string) => void;
  onExecuteQuery?: (value: string) => void;
};

/**
 * Creates a CodeMirror instance for editing SQL
 *
 * @param domSelector DOM Element where the editor will be rendered
 * @param params Editor configuration
 */
export function useSqlEditor(domSelector: string, params: EditorParams) {
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
          sql(),

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
