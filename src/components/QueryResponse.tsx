import React from "react";

import { useEditor } from "../hooks/useEditor/useEditor";
import styles from "./QueryEditor.module.css";

type QueryResponseProps = {
  value?: string;
  onChange?: (value: string) => void;
};

export function QueryResponse({ value = "{}", onChange }: QueryResponseProps) {
  useEditor("#query-editor", { code: value, mode: "json" });

  return (
    <div id="query-editor" className={styles.skeleton}>
      {/* Fallback content */}
      <div className={styles.gutter}></div>
      <div className={styles.content}></div>
    </div>
  );
}
