import localforage from "localforage";

localforage.config({
  name: "@prisma/text-editors",
  storeName: "types",
});

window.localforage = localforage;

interface ExtendedWindow extends Window {
  localforage?: typeof localforage;
}
declare const window: ExtendedWindow;

export type { FileMap, SQLDialect, ThemeName } from "./editor";
export { JSONEditor } from "./react/JSONEditor";
export type { JSONEditorProps } from "./react/JSONEditor";
export { PrismaSchemaEditor } from "./react/PrismaSchemaEditor";
export type { PrismaSchemaEditorProps } from "./react/PrismaSchemaEditor";
export { SQLEditor } from "./react/SQLEditor";
export type { SQLEditorProps } from "./react/SQLEditor";
export { TSEditor } from "./react/TSEditor";
export type { TSEditorProps } from "./react/TSEditor";
