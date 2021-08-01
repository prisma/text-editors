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
import { behaviourExtension } from "./extensions/behaviour";
import { keymapExtension } from "./extensions/keymap";
import { theme, ThemeName } from "./extensions/theme";

const log = logger("sql-editor", "aquamarine");

export type SQLDialect = "postgresql" | "mysql" | "sqlserver";

type EditorParams = {
  domElement: Element;
  code: string;
  dialect?: SQLDialect;
  readonly?: boolean;
  theme?: ThemeName;
  onChange?: (value: string) => void;
  onExecuteQuery?: (query: string) => void;
};

export class Editor {
  private view: EditorView;

  constructor(params: EditorParams) {
    const sqlDialect = this.getSqlDialect(params.dialect);

    this.view = new EditorView({
      parent: params.domElement,
      dispatch: transaction => {
        // Update view first
        this.view.update([transaction]);

        // Then tell tsserver about new file (on a debounce to avoid ddos-ing it)
        if (transaction.docChanged) {
          params.onChange?.(transaction.newDoc.sliceString(0));
        }
      },
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

          theme(
            params.theme || "dark",
            params.domElement.getBoundingClientRect()
          ),
          behaviourExtension,
          keymapExtension,
        ],
      }),
    });

    log("Initialized");
  }

  private getSqlDialect(dialect?: SQLDialect) {
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
  }

  public forceUpdate = (code: string) => {
    this.view.dispatch({
      changes: [
        { from: 0, to: this.view.state.doc.length },
        { from: 0, insert: code },
      ],
    });
  };

  public destroy = () => {
    this.view.destroy();
  };
}
