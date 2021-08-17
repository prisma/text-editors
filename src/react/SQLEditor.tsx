import React, {
  CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { SQLEditor as Editor, ThemeName } from "../editor";

export type SQLEditorProps = {
  /** Initial value of the editor when it is first loaded */
  initialValue: string;
  /** (Controlled) Value of the editor.
   * Be careful when using this, this will force the editor to be redrawn from scratch.
   * Typically, you should only react to changes to the value by subscribing to `onChange`, and let the editor own the `value`.
   */
  value?: string;
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
  initialValue,
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
      code: initialValue,
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
    value && editor?.forceUpdate(value);
  }, [editor, value]);

  // Ensures `theme` given to this component is always reflected in the editor
  useEffect(() => {
    theme && editor?.setTheme(theme);
  }, [editor, theme]);

  // Ensures `dimensions` given to this component are always reflected in the editor
  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => editor?.setDimensions());

    ro.observe(ref.current!);
    return () => {
      ro.unobserve(ref.current!);
    };
  }, [editor]);

  return (
    <section
      ref={ref}
      id="sql-editor"
      style={{ width: "100%", height: "100%", ...style }}
      className={className}
    />
  );
}
