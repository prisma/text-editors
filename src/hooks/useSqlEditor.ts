import { sql } from "@codemirror/lang-sql";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { useEffect } from "react";
import { logger } from "../logger";
import { useEditorAppearance } from "./useEditorAppearance";
import { useEditorBehaviour } from "./useEditorBehaviour";
import { useEditorKeymap } from "./useEditorKeymap";
import { useEditorParent } from "./useEditorParent";
import { useEditorTheme } from "./useEditorTheme";

const log = logger("sql-editor", "aquamarine");

type EditorParams = {
  code: string;
  readonly?: boolean;
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
  const editorTheme = useEditorTheme(dimensions);

  const appearanceExtensions = useEditorAppearance();
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

          editorTheme,
          ...appearanceExtensions,
          ...behaviourExtensions,
          ...keyMapExtensions,
        ],
      }),
    });

    log("Initialized");

    return () => {
      view.destroy();
    };
  });
}
