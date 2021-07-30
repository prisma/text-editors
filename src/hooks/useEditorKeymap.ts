import { completionKeymap } from "@codemirror/autocomplete";
import { closeBracketsKeymap } from "@codemirror/closebrackets";
import { defaultKeymap, defaultTabBinding } from "@codemirror/commands";
import { commentKeymap } from "@codemirror/comment";
import { foldKeymap } from "@codemirror/fold";
import { undo } from "@codemirror/history";
import { Extension } from "@codemirror/state";
import { keymap } from "@codemirror/view";

export function useEditorKeymap(): Extension {
  return [
    keymap.of([
      defaultTabBinding,
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
}
