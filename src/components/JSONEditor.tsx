import React, { useEffect, useRef, useState } from "react";
import { JSONEditor, ThemeName } from "../editor";

type EditorProps = {
  /** (Uncontrolled) initial value of the editor */
  initialValue: string;
  /** Controls if the editor is readonly */
  readonly?: boolean;
  /** Theme for the editor */
  theme?: ThemeName;
  /** Callback called when the value of the editor changes (debounced) */
  onChange?: (value: string) => void;
};

export function Editor({ initialValue, theme, onChange }: EditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<JSONEditor>();

  useEffect(() => {
    const jsonEditor = new JSONEditor({
      domElement: ref.current!, // `!` is fine because this will run after the component has mounted
      code: initialValue,
      theme,
      onChange,
    });
    setEditor(jsonEditor);

    return () => {
      jsonEditor?.destroy();
      setEditor(undefined);
    };
  }, []);

  return <div ref={ref} style={{ width: "100%", height: "100%" }} />;
}
