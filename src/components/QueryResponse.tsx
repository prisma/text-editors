import React from "react";

import { useJsonEditor } from "../hooks/useJsonEditor";
import styles from "./QueryEditor.module.css";

type QueryResponseProps = {
  value?: string;
  onChange?: (value: string) => void;
};

export function QueryResponse({ value = "{}", onChange }: QueryResponseProps) {
  useJsonEditor("#query-editor", { code: value, readonly: true });

  return (
    <div id="query-editor" className={styles.skeleton}>
      {/* Fallback content */}
      <div className={styles.gutter}></div>
      <div className={styles.content}></div>
    </div>
  );
}
