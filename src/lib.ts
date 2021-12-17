import "@fontsource/jetbrains-mono";
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

export type { FileMap, PrismaQuery, SQLDialect, ThemeName } from "./editor";
export { Editor } from "./react/Editor";
export type { EditorProps } from "./react/Editor";
