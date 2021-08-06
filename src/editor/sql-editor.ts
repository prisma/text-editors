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
import { debounce } from "lodash-es";
import { logger } from "../logger";
import {
  appearance,
  setDimensions,
  setTheme,
  ThemeName,
} from "./extensions/appearance";
import { behaviour } from "./extensions/behaviour";
import { keymap } from "./extensions/keymap";

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
  private domElement: Element;
  private view: EditorView;

  constructor(params: EditorParams) {
    const { width, height } = params.domElement.getBoundingClientRect();
    const sqlDialect = this.getSqlDialect(params.dialect);

    this.domElement = params.domElement;
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

    const onResizeDebounced = debounce(this.setDimensions, 2000);
    window.addEventListener("resize", onResizeDebounced);
  }

  private setDimensions = () => {
    const dimensions = this.domElement.getBoundingClientRect();
    this.view.dispatch(setDimensions(dimensions.width, dimensions.height));
  };

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

  public setTheme(theme: ThemeName) {
    this.view.dispatch(setTheme(theme));
  }

  public forceUpdate = (code: string) => {
    log("Force updating editor value");

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
