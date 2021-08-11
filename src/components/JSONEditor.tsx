import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { JSONEditor, ThemeName } from "../editor";

type EditorProps = {
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
};

export function Editor({
  value,
  readonly,
  theme,
  style,
  className,
  onChange,
}: EditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<JSONEditor>();

  // Handles editor lifecycle
  useEffect(() => {
    const jsonEditor = new JSONEditor({
      domElement: ref.current!, // `!` is fine because this will run after the component has mounted
      code: value,
      readonly,
      theme,
      onChange,
    });
    setEditor(jsonEditor);

    return () => {
      jsonEditor?.destroy();
      setEditor(undefined);
    };
  }, []);

  // Ensures `value` given to this component is always reflected in the editor
  useEffect(() => {
    editor?.forceUpdate(value);
  }, [value]);

  // Ensures `theme` given to this component is always reflected in the editor
  useEffect(() => {
    theme && editor?.setTheme(theme);
  }, [theme]);

  return <div ref={ref} id="json-editor" style={style} className={className} />;
}
