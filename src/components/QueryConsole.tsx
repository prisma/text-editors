import React from "react";

import { useEditor } from "../hooks/useEditor/useEditor";

const complexCode = `// Demo code

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

const simpleCode = `
type Account1 = {
  provider: "github" | "heroku"
}
const account: Account1[] = [{
  provider: ""
}]

type X = "A" | "B";
const x: X = ""

const y = 2;
const z = 2 + 
`;

const code = "const x = 2 + 2";

export function QueryConsole() {
  useEditor("#editor", simpleCode);

  return <div id="editor" style={{ width: "100%", height: "100%" }}></div>;
}
