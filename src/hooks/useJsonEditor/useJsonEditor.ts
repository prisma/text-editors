import { useEffect } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter } from "@codemirror/lint";

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

export function useJsonEditor(domSelector: string, params: EditorParams) {
  const { parent, dimensions } = useEditorParent(domSelector);
  const editorTheme = useEditorTheme(dimensions);

  const appearanceExtensions = useEditorAppearance();
  const behaviourExtensions = useEditorBehaviour();
  const keyMapExtensions = useEditorKeymap();

  useEffect(() => {
    const view = new EditorView({
      parent,
      dispatch: transaction => {
        if (params.readonly && transaction.docChanged) {
          return;
        }

        // Update view first
        view.update([transaction]);
      },
      state: EditorState.create({
        doc: params.code,

        extensions: [
          json(),
          linter(jsonParseLinter()),

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
