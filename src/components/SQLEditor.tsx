import React, { useEffect, useRef, useState } from "react";
import { SQLEditor, ThemeName } from "../editor";

type EditorProps = {
  /** (Controlled) Value of the editor */
  value: string;
  /** Controls if the editor is readonly */
  readonly?: boolean;
  /** Theme for the editor */
  theme?: ThemeName;
  /** Callback called when the value of the editor changes (debounced) */
  onChange?: (value: string) => void;
  /** Callback called when the user requests a query to be run */
  onExecuteQuery?: (query: string) => void;
};

export function Editor({
  value,
  theme,
  onChange,
  onExecuteQuery,
}: EditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<SQLEditor>();

  // Handles editor lifecycle
  useEffect(() => {
    const sqlEditor = new SQLEditor({
      domElement: ref.current!, // `!` is fine because this will run after the component has mounted
      code: value,
      theme,
      onChange,
      onExecuteQuery,
    });
    setEditor(sqlEditor);

    return () => {
      sqlEditor?.destroy();
      setEditor(undefined);
    };
  }, []);

  // Ensures `value` given to this component is always reflected in the editor
  useEffect(() => {
    editor?.forceUpdate(value);
  }, [value]);

  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}
