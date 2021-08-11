/**
 * This file is the entrypoint for the PrismaQuery extension. It exports multiple extensions that make Prisma Query functionality work. This includes:
 *
 * STATE:
 * 1. A StateField that will hold ranges and values of PrismaClient queries
 * 2. A Facet that will be used to register one or more `onExecute` handlers. This facet's value will be accessible by the StateField
 * 3. A `state` extension that tracks Prisma Client queries in the editor
 *
 * KEYMAP:
 * 1. A keyMap that finds the query under the user's cursor and runs it
 *
 * GUTTER:
 * 1. A GutterMarker that displays an element in the gutter for all lines that are valid PrismaClient queries
 * 2. An extension that enables this element and styles it
 *
 * LINE NUMBERS:
 * 1. A GutterMarker that displays a run button in the gutter for all lines that are valid PrismaClient queries
 * 2. An extension that enables this functionality
 *
 * HIGHLIGHT:
 * 1. A custom highlight style that dims all lines that aren't PrismaClient queries
 * 2. An extension that enables it
 *
 * The "correct" way to read these files is in the order they're mentioned up above
 */

export { gutter } from "./gutter";
export { highlightStyle } from "./highlight";
export { keymap } from "./keymap";
export { lineNumbers } from "./line-numbers";
export { state } from "./state";
