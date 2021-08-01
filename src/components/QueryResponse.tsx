import React from "react";
import { ThemeName } from "../editor/extensions/theme";
import { useJsonEditor } from "../hooks/useJsonEditor";
import styles from "./QueryEditor.module.css";

export type { ThemeName } from "../editor/extensions/theme";

type QueryResponseProps = {
  /** (Uncontrolled) initial value of the editor */
  initialValue?: string;
  /** Theme for the editor */
  theme?: ThemeName;
  /** Callback called when the value of the editor changes (debounced) */
  onChange?: (value: string) => void;
};

export function QueryResponse({
  initialValue = "{}",
  theme,
  onChange,
}: QueryResponseProps) {
  useJsonEditor("#query-editor", {
    code: initialValue,
    readonly: true,
    theme,
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
