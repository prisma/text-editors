import React, { useEffect, useRef, useState } from "react";
import { SQLEditor, ThemeName } from "../editor";

type EditorProps = {
  /** (Uncontrolled) initial value of the editor */
  initialValue: string;
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
  initialValue,
  theme,
  onChange,
  onExecuteQuery,
}: EditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<SQLEditor>();

  useEffect(() => {
    const sqlEditor = new SQLEditor({
      domElement: ref.current!, // `!` is fine because this will run after the component has mounted
      code: initialValue,
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

  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}
