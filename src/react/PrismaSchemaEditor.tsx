import React, {
  CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { PrismaSchemaEditor as Editor, ThemeName } from "../editor";

export type PrismaSchemaEditorProps = {
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
};

export function PrismaSchemaEditor({
  initialValue,
  value,
  readonly,
  theme,
  style,
  className,
  onChange,
}: PrismaSchemaEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<Editor>();

  // Handles editor lifecycle
  useEffect(() => {
    const jsonEditor = new Editor({
      domElement: ref.current!, // `!` is fine because this will run after the component has mounted
      code: initialValue,
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
  }, [editor, value]);

  // Ensures `theme` given to this component is always reflected in the editor
  useEffect(() => {
    editor?.setTheme(theme);
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
      id="prisma-schema-editor"
      style={{ width: "100%", height: "100%", ...style }}
      className={className}
    />
  );
}
