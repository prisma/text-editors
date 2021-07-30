import React from "react";
import { ThemeName } from "../hooks/useEditorTheme";
import { useSqlEditor } from "../hooks/useSqlEditor";
import { FileMap, useTypescriptEditor } from "../hooks/useTypescriptEditor";
import styles from "./QueryEditor.module.css";

export type EditorMode = "typescript" | "sql";
export type { ThemeName } from "../hooks/useEditorTheme";

type QueryEditorProps = {
  /** Controls what language this editor works with */
  mode: EditorMode;
  /** Additional Typescript types to load into the editor */
  types?: FileMap;
  /** (Uncontrolled) initial value of the editor */
  initialValue: string;
  /** Theme for the editor */
  theme?: ThemeName;
  /** Callback called when the value of the editor changes (debounced) */
  onChange?: (value: string) => void;
  /** Callback called when the user requests a query to be run */
  onExecuteQuery?: (query: string) => void;
};

export function QueryEditor({
  mode = "typescript",
  types,
  initialValue,
  theme,
  onChange,
  onExecuteQuery,
}: QueryEditorProps) {
  // Conditional hooks are fine because we do not support changing `mode` after first render
  if (mode === "typescript") {
    useTypescriptEditor("#query-response", {
      code: initialValue,
      types,
      theme,
      onChange,
      onExecuteQuery,
    });
  } else if (mode === "sql") {
    useSqlEditor("#query-response", { code: initialValue });
  }

  return (
    <div id="query-response" className={styles.skeleton}>
      {/* Fallback content */}
      <div className={styles.gutter}></div>
      <div className={styles.content}></div>
    </div>
  );
}
