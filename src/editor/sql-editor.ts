import {
  keywordCompletion,
  MSSQL,
  MySQL,
  PostgreSQL,
  schemaCompletion,
  sql,
  StandardSQL,
} from "@codemirror/lang-sql";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { appearance, ThemeName } from "../extensions/appearance";
import { behaviour } from "../extensions/behaviour";
import { keymap } from "../extensions/keymap";
import { logger } from "../logger";
import { BaseEditor } from "./base-editor";

const log = logger("sql-editor", "aquamarine");

export type SQLDialect = "postgresql" | "mysql" | "sqlserver";

type SQLEditorParams = {
  domElement: Element;
  code: string;
  dialect?: SQLDialect;
  readonly?: boolean;
  theme?: ThemeName;
  onChange?: (value: string) => void;
  onExecuteQuery?: (query: string) => void;
};

export class SQLEditor extends BaseEditor {
  protected view: EditorView;

  /**
   * Returns a state-only version of the editor, without mounting the actual view anywhere. Useful for testing.
   */
  static state(params: SQLEditorParams) {
    const sqlDialect = getSqlDialect(params.dialect);

    return EditorState.create({
      doc: params.code,

      extensions: [
        EditorView.editable.of(!params.readonly),
        sql(),
        schemaCompletion({
          dialect: sqlDialect,
          tables: [],
        }),
        keywordCompletion(sqlDialect, true),

        appearance({ domElement: params.domElement, theme: params.theme }),
        behaviour({ onChange: params.onChange }),
        keymap(),
      ],
    });
  }

  constructor(params: SQLEditorParams) {
    super(params);

    this.view = new EditorView({
      parent: params.domElement,
      state: SQLEditor.state(params),
    });

    log("Initialized");
  }
}

const getSqlDialect = (dialect?: SQLDialect) => {
  switch (dialect) {
    case "postgresql":
      return PostgreSQL;
    case "mysql":
      return MySQL;
    case "sqlserver":
      return MSSQL;
    default:
      return StandardSQL;
  }
};
