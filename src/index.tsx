import React from "react";
import ReactDOM from "react-dom";

import { QueryEditor } from "./components/QueryEditor";
import { QueryResponse } from "./components/QueryResponse";
import "./index.css";

const tsCode = `type User = {
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

const sqlCode = `SELECT * FROM Users;
INSERT INTO Account (id, provider) VALUES (1, "github");
`;

const jsonCode = `[{
  "id": 1,
  "name": "Sid",
  "email": "sinha@prisma.io",
  "accounts": [{
    "provider": "github",
    "userId": 1
  }, {
    "provider": "heroku",
    "userId": 1
  }]
}]`;

ReactDOM.render(
  <React.StrictMode>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div style={{ flex: 1 }}>
        <QueryEditor mode="typescript" value={tsCode} />
        {/* <QueryEditor mode="sql" value={sqlCode} /> */}
      </div>
      <div style={{ flex: "0 0 4px", backgroundColor: "skyblue" }}></div>
      <div style={{ flex: 1 }}>
        <QueryResponse value={jsonCode} />
      </div>
    </div>
  </React.StrictMode>,
  document.getElementById("root")
);
