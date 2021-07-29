import { keymap } from "@codemirror/view";
import { defaultKeymap, defaultTabBinding } from "@codemirror/commands";
import { completionKeymap } from "@codemirror/autocomplete";
import { closeBracketsKeymap } from "@codemirror/closebrackets";
import { commentKeymap } from "@codemirror/comment";
import { foldKeymap } from "@codemirror/fold";
import { undo } from "@codemirror/history";

export function useEditorKeymap() {
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
