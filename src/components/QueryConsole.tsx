import React from "react";

import { useEditor } from "../hooks/useEditor";

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

    accounts: [{
      provider: "",
       user: {

       }
    }]
};
`;

export function QueryConsole() {
  useEditor("#editor", code);

  return <div id="editor" style={{ width: "100%", height: "100%" }}></div>;
}
