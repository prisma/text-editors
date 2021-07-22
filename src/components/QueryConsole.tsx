import React from "react";
import { useEditor } from "../hooks/useEditor";

import { useTSWorker } from "../hooks/useTSWorker";

const code = `// Demo code

type User = {
  id: number
  name: string
  email: string
  accounts: Account[]
}

type Account = {
  provider: "github" | "heroku"
  user: User
}

const user: User = {

};
`;

export function QueryConsole() {
  useTSWorker();
  useEditor(code);

  return <div id="editor" style={{ width: "100%", height: "100%" }}></div>;
}
