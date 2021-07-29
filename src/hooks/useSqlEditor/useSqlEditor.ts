import { useEffect, useState } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { sql } from "@codemirror/lang-sql";

import { log } from "./log";
import { useEditorTheme } from "../useEditorTheme";
import { useEditorAppearance } from "../useEditorAppearance";
import { useEditorBehaviour } from "../useEditorBehaviour";
import { useEditorKeymap } from "../useEditorKeymap";

type EditorParams = {
  code: string;
  readonly?: boolean;
};

export function useSqlEditor(domSelector: string, params: EditorParams) {
  const [parent, setParent] = useState<Element>();
  const [dimensions, setDimensions] = useState<DOMRect>();
  useEffect(() => {
    const parent = document.querySelector(domSelector)!;
    setParent(parent);
    while (parent && parent.firstChild) parent.removeChild(parent.firstChild); // Empty out parent
    setDimensions(parent.getBoundingClientRect());
  }, []);

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
          // Language
          sql(),

          // Appearance
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
