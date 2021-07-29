import React from "react";

import { useJsonEditor } from "../hooks/useJsonEditor";
import styles from "./QueryEditor.module.css";

type QueryResponseProps = {
  initialValue?: string;
  onChange?: (value: string) => void;
};

export function QueryResponse({
  initialValue = "{}",
  onChange,
}: QueryResponseProps) {
  useJsonEditor("#query-editor", {
    code: initialValue,
    readonly: true,
    onChange,
  });

  return (
    <div id="query-editor" className={styles.skeleton}>
      {/* Fallback content */}
      <div className={styles.gutter}></div>
      <div className={styles.content}></div>
    </div>
  );
}
