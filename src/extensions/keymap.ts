import { completionKeymap } from "@codemirror/autocomplete";
import { closeBracketsKeymap } from "@codemirror/closebrackets";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { commentKeymap } from "@codemirror/comment";
import { foldKeymap } from "@codemirror/fold";
import { undo } from "@codemirror/history";
import { Extension } from "@codemirror/state";
import { keymap as keymapFacet } from "@codemirror/view";

export const keymap = (): Extension => [
  keymapFacet.of([
    indentWithTab,
    ...defaultKeymap,
    ...closeBracketsKeymap,
    ...commentKeymap,
    ...completionKeymap,
    ...foldKeymap,
    {
      key: "Ctrl-z",
      mac: "Mod-z",
      run: undo,
    },
  ]),
];
