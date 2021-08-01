import React, { useEffect, useRef, useState } from "react";
import { ThemeName, TSEditor } from "../editor";
import { FileMap } from "../typescript";

type EditorProps = {
  /** (Uncontrolled) initial value of the editor */
  initialValue: string;
  /** Controls if the editor is readonly */
  readonly?: boolean;
  /** Theme for the editor */
  theme?: ThemeName;
  /** Additional Typescript types to load into the editor */
  types?: FileMap;
  /** Callback called when the value of the editor changes (debounced) */
  onChange?: (value: string) => void;
  /** Callback called when the user requests a query to be run */
  onExecuteQuery?: (query: string) => void;
};

export function Editor({
  initialValue,
  readonly,
  types,
  theme,
  onChange,
  onExecuteQuery,
}: EditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<TSEditor>();

  useEffect(() => {
    setEditor(
      new TSEditor({
        domElement: ref.current!, // `!` is fine because this will run after the component has mounted
        code: initialValue,
        readonly,
        theme,
        types,
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
