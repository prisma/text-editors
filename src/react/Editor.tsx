import isEqual from "lodash/isEqual";
import isEqualWith from "lodash/isEqualWith";
import React, { CSSProperties } from "react";
import {
  FileMap,
  JSONEditor,
  PrismaSchemaEditor,
  SQLEditor,
  ThemeName,
  TSEditor,
} from "../editor";

type LangEditor = TSEditor | JSONEditor | SQLEditor | PrismaSchemaEditor;

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

// This component is deliberately not a function component because hooks complicate the logic we need for it

export class Editor extends React.Component<EditorProps> {
  private ref = React.createRef<HTMLDivElement>();
  private editor?: LangEditor;
  private resizeObserver?: ResizeObserver;

  componentDidMount() {
    switch (this.props.lang) {
      case "ts":
        this.editor = new TSEditor({
          domElement: this.ref.current!, // `!` is fine because this will run after the component has mounted
          code: this.props.value,
          readonly: this.props.readonly,
          theme: this.props.theme,
          types: this.props.types,
          onChange: this.props.onChange,
          onExecuteQuery: this.props.onExecuteQuery,
        });
        break;

      case "json":
        this.editor = new JSONEditor({
          domElement: this.ref.current!, // `!` is fine because this will run after the component has mounted
          code: this.props.value,
          readonly: this.props.readonly,
          theme: this.props.theme,
          onChange: this.props.onChange,
        });
        break;

      case "sql":
        this.editor = new SQLEditor({
          domElement: this.ref.current!, // `!` is fine because this will run after the component has mounted
          code: this.props.value,
          readonly: this.props.readonly,
          theme: this.props.theme,
          onChange: this.props.onChange,
        });
        break;

      case "prisma":
        this.editor = new PrismaSchemaEditor({
          domElement: this.ref.current!, // `!` is fine because this will run after the component has mounted
          code: this.props.value,
          readonly: this.props.readonly,
          theme: this.props.theme,
          onChange: this.props.onChange,
        });
        break;

      default:
        throw new Error("Unknown `lang` prop provided to Editor");
    }

    this.resizeObserver = new ResizeObserver(() =>
      this.editor?.setDimensions()
    );
    this.resizeObserver.observe(this.ref.current!);
  }

  shouldComponentUpdate(nextProps: EditorProps) {
    // Do a deep comparison check for props
    // We need this because `types` is an object
    return !isEqualWith(this.props, nextProps, (a, b) => {
      if (typeof a === "function" || typeof b === "function") {
        // Do not compare functions
        return true;
      }

      // Let lodash handle comparing the rest
      return undefined;
    });
  }

  componentDidUpdate(prevProps: EditorProps) {
    if (!this.editor) {
      return;
    }

    // Ensures `value` given to this component is always reflected in the editor
    if (this.props.value !== this.editor.state.sliceDoc(0)) {
      this.editor.forceUpdate(this.props.value);
    }

    // Ensures `types` given to this component are always reflected in the editor
    if (prevProps.lang === "ts" && this.props.lang === "ts") {
      if (this.props.types && !isEqual(prevProps.types, this.props.types)) {
        (this.editor as TSEditor).injectTypes(this.props.types);
      }
    }

    // Ensures `theme` given to this component is always reflected in the editor
    if (this.props.theme && prevProps.theme !== this.props.theme) {
      this.editor.setTheme(this.props.theme);
    }
  }

  componentWillUnmount() {
    this.resizeObserver?.disconnect();
  }

  render() {
    return (
      <section
        ref={this.ref}
        id={`${this.props.lang}-editor`}
        style={{ width: "100%", height: "100%", ...this.props.style }}
        className={this.props.className}
      />
    );
  }
}
