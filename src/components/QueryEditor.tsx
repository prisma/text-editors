import React from "react";

import { useTypescriptEditor } from "../hooks/useTypescriptEditor";
import { useSqlEditor } from "../hooks/useSqlEditor";
import styles from "./QueryEditor.module.css";

export type EditorMode = "typescript" | "sql";
type QueryEditorProps = {
  mode?: EditorMode;
  value: string;
  onChange?: (value: string) => void;
  onExecuteQuery?: (query: string) => void;
};

export function QueryEditor({
  mode = "typescript",
  value,
  onChange,
  onExecuteQuery,
}: QueryEditorProps) {
  // Conditional hooks are fine because we do not support changing `mode` after first render
  if (mode === "typescript") {
    useTypescriptEditor("#query-response", { code: value });
  } else if (mode === "sql") {
    useSqlEditor("#query-response", { code: value });
  }

  return (
    <div id="query-response" className={styles.skeleton}>
      {/* Fallback content */}
      <div className={styles.gutter}></div>
      <div className={styles.content}></div>
    </div>
  );
}
