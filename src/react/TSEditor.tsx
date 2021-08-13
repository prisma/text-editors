import React, {
  CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { FileMap, ThemeName, TSEditor as Editor } from "../editor";

export type TSEditorProps = {
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
  /** Additional Typescript types to load into the editor */
  types?: FileMap;
  /** Additional styles for the editor container */
  style?: CSSProperties;
  /** Additional classes for the editor container */
  className?: string;
  /** Callback called when the value of the editor changes (debounced) */
  onChange?: (value: string) => void;
  /** Callback called when the user requests a query to be run */
  onExecuteQuery?: (query: string) => void;
};

export function TSEditor({
  initialValue,
  value,
  readonly,
  types,
  theme,
  style,
  className,
  onChange,
  onExecuteQuery,
}: TSEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<Editor>();

  // Handles editor lifecycle
  useEffect(() => {
    const tsEditor = new Editor({
      domElement: ref.current!, // `!` is fine because this will run after the component has mounted
      code: initialValue,
      readonly,
      theme,
      types,
      onChange,
      onExecuteQuery,
    });
    setEditor(tsEditor);

    return () => {
      tsEditor?.destroy();
      setEditor(undefined);
    };
  }, []);

  // Ensures `types` given to this component are always reflected in the editor
  useEffect(() => {
    editor?.injectTypes(types || {});
  }, [editor, types]);

  // Ensures `value` given to this component is always reflected in the editor
  useEffect(() => {
    editor?.forceUpdate(value);
  }, [value]);

  // Ensures `theme` given to this component is always reflected in the editor
  useEffect(() => {
    editor?.setTheme(theme);
  }, [theme]);

  // Ensures `dimensions` given to this component are always reflected in the editor
  useLayoutEffect(() => {
    editor?.setDimensions();
  }, [className, style]);

  return (
    <section ref={ref} id="ts-editor" style={style} className={className} />
  );
}
