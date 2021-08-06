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
import { logger } from "../logger";
import { BaseEditor } from "./base-editor";
import { appearance, ThemeName } from "./extensions/appearance";
import { behaviour } from "./extensions/behaviour";
import { keymap } from "./extensions/keymap";

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

  constructor(params: SQLEditorParams) {
    super(params);

    const { width, height } = params.domElement.getBoundingClientRect();
    const sqlDialect = getSqlDialect(params.dialect);

    this.view = new EditorView({
      parent: params.domElement,
      state: EditorState.create({
        doc: params.code,

        extensions: [
          EditorView.editable.of(!params.readonly),
          sql(),
          schemaCompletion({
            dialect: sqlDialect,
            tables: [],
          }),
          keywordCompletion(sqlDialect, true),

          appearance({ theme: params.theme, width, height }),
          behaviour({ onChange: params.onChange }),
          keymap(),
        ],
      }),
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
