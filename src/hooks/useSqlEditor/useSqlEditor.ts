import { useEffect } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { sql } from "@codemirror/lang-sql";

import { log } from "./log";
import { useEditorParent } from "../useEditorParent";
import { useEditorTheme } from "../useEditorTheme";
import { useEditorAppearance } from "../useEditorAppearance";
import { useEditorBehaviour } from "../useEditorBehaviour";
import { useEditorKeymap } from "../useEditorKeymap";

type EditorParams = {
  code: string;
  readonly?: boolean;
};

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
        if (transaction.docChanged) {
          return;
        }

        // Update view first
        view.update([transaction]);
      },
      state: EditorState.create({
        doc: params.code,

        extensions: [
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
