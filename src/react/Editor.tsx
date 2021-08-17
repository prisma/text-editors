import React, {
  CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  FileMap,
  JSONEditor,
  PrismaSchemaEditor,
  SQLEditor,
  ThemeName,
  TSEditor,
} from "../editor";

export type EditorProps = {
  /** (Controlled) Value of the editor.
   *
   * Typically, you should only react to changes to the value by subscribing to `onChange`, and let the editor own the `value`.
   * Changing this value on your own will force the editor to be redrawn from scratch.
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
} & (
  | {
      /** Language to syntax highlight text as */
      lang: "ts";
      /** Additional Typescript types to load into the editor */
      types?: FileMap;
      /** Callback called when the user requests a query to be run */
      onExecuteQuery?: (query: string) => void;
    }
  | {
      lang: "json";
    }
  | {
      lang: "sql";
    }
  | {
      lang: "prisma";
    }
);

type LangEditor = TSEditor | JSONEditor | SQLEditor | PrismaSchemaEditor;

export function Editor(props: EditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [cmInstance, setCmInstance] = useState<LangEditor>();
  const [code, setCode] = useState(props.value); // Save a copy of the value from props for optimization purposes

  // Handles editor lifecycle
  useEffect(() => {
    let cm: LangEditor;
    switch (props.lang) {
      case "ts":
        cm = new TSEditor({
          domElement: ref.current!, // `!` is fine because this will run after the component has mounted
          code: props.value,
          readonly: props.readonly,
          theme: props.theme,
          types: props.types,
          onChange: c => {
            setCode(c);
            props.onChange?.(c);
          },
          onExecuteQuery: props.onExecuteQuery,
        });
        break;

      case "json":
        cm = new JSONEditor({
          domElement: ref.current!, // `!` is fine because this will run after the component has mounted
          code: props.value,
          readonly: props.readonly,
          theme: props.theme,
          onChange: c => {
            setCode(c);
            props.onChange?.(c);
          },
        });
        break;

      case "sql":
        cm = new SQLEditor({
          domElement: ref.current!, // `!` is fine because this will run after the component has mounted
          code: props.value,
          readonly: props.readonly,
          theme: props.theme,
          onChange: c => {
            setCode(c);
            props.onChange?.(c);
          },
        });
        break;

      case "prisma":
        cm = new PrismaSchemaEditor({
          domElement: ref.current!, // `!` is fine because this will run after the component has mounted
          code: props.value,
          readonly: props.readonly,
          theme: props.theme,
          onChange: c => {
            setCode(c);
            props.onChange?.(c);
          },
        });
        break;

      default:
        throw new Error("Unknown `lang` prop provided to Editor");
    }

    setCmInstance(cm);

    return () => {
      cm?.destroy();
      setCmInstance(undefined);
    };
  }, []);

  // Ensures `value` given to this component is always reflected in the editor
  useEffect(() => {
    // To prevent unnecessary `forceUpdate`s (since they're very expensive), we make sure the incoming value has actually changed
    if (props.value === code) {
      return;
    }

    cmInstance?.forceUpdate(props.value);
    setCode(props.value);
  }, [cmInstance, props.value]);

  // Ensures `types` given to this component is always reflected in the editor
  // Conditional hook is fine because we do not expect `lang` to change across renders
  props.lang === "ts" &&
    useEffect(() => {
      if (!props.types) {
        return;
      }

      (cmInstance as TSEditor)?.injectTypes(props.types);
    }, [cmInstance, props.types]);

  // Ensures `theme` given to this component is always reflected in the editor
  useEffect(() => {
    cmInstance?.setTheme(props.theme);
  }, [cmInstance, props.theme]);

  // Ensures `dimensions` given to this component are always reflected in the editor
  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => cmInstance?.setDimensions());

    ro.observe(ref.current!);
    return () => {
      ro.unobserve(ref.current!);
    };
  }, [cmInstance]);

  return (
    <section
      ref={ref}
      id={`${props.lang}-editor`}
      style={{ width: "100%", height: "100%", ...props.style }}
      className={props.className}
    />
  );
}
