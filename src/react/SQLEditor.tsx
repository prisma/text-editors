import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { SQLEditor as Editor, ThemeName } from "../editor";

export type SQLEditorProps = {
  /** (Controlled) Value of the editor */
  value: string;
  /** Controls if the editor is readonly */
  readonly?: boolean;
  /** Theme for the editor */
  theme?: ThemeName;
  /** Additional styles for the editor container */
  style?: CSSProperties;
  /** Additional classes for the editor container */
  className?: string;
  /** Callback called when the value of the editor changes (debounced) */
  onChange?: (value: string) => void;
  /** Callback called when the user requests a query to be run */
  onExecuteQuery?: (query: string) => void;
};

export function SQLEditor({
  value,
  readonly,
  theme,
  style,
  className,
  onChange,
  onExecuteQuery,
}: SQLEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<Editor>();

  // Handles editor lifecycle
  useEffect(() => {
    const sqlEditor = new Editor({
      domElement: ref.current!, // `!` is fine because this will run after the component has mounted
      code: value,
      readonly,
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

  // Ensures `theme` given to this component is always reflected in the editor
  useEffect(() => {
    editor?.setTheme(theme);
  }, [theme]);

  return <div ref={ref} id="sql-editor" style={style} className={className} />;
}
