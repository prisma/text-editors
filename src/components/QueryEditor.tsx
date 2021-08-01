import React, { useEffect, useRef, useState } from "react";
import { Editor, FileMap, ThemeName } from "../editor";

export type EditorMode = "typescript" | "sql";
export type { ThemeName } from "../editor/extensions/theme";

type QueryEditorProps = {
  /** Controls what language this editor works with */
  mode: EditorMode;
  /** Additional Typescript types to load into the editor */
  types?: FileMap;
  /** (Uncontrolled) initial value of the editor */
  initialValue: string;
  /** Theme for the editor */
  theme?: ThemeName;
  /** Callback called when the value of the editor changes (debounced) */
  onChange?: (value: string) => void;
  /** Callback called when the user requests a query to be run */
  onExecuteQuery?: (query: string) => void;
};

export function QueryEditor({
  mode = "typescript",
  types,
  initialValue,
  theme,
  onChange,
  onExecuteQuery,
}: QueryEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<Editor>();

  useEffect(() => {
    setEditor(
      new Editor({
        domElement: ref.current!, // `!` is fine because this will run after the component has mounted
        code: initialValue,
        types,
        theme,
        onChange,
        onExecuteQuery,
      })
    );

    return () => {
      editor?.destroy();
      setEditor(undefined);
    };
  }, []);

  useEffect(() => {
    editor?.injectTypes(types || {});
  }, [types]);

  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}
