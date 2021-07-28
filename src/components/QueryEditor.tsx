import React from "react";

import { EditorMode, useEditor } from "../hooks/useEditor/useEditor";
import styles from "./QueryEditor.module.css";

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
  useEditor("#query-response", { code: value, mode });

  return (
    <div id="query-response" className={styles.skeleton}>
      {/* Fallback content */}
      <div className={styles.gutter}></div>
      <div className={styles.content}></div>
    </div>
  );
}
