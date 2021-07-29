import React from "react";
import ReactDOM from "react-dom";

import { QueryEditor } from "./components/QueryEditor";
import { QueryResponse } from "./components/QueryResponse";
import "./index.css";

const QUERY_BASE_URL: string = "https://qc.prisma-adp.vercel.app";

const tsCode: string = `type User = {
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
};`;

const sqlCode: string = `SELECT * FROM Users;
INSERT INTO Account (id, provider) VALUES (1, "github");`;

const jsonCode: string = `[{
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

const Dev = () => {
  const runQuery = (query: string) => {};

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div style={{ flex: 1 }}>
        <QueryEditor mode="typescript" value={tsCode} onChange={runQuery} />
        {/* <QueryEditor mode="sql" value={sqlCode} /> */}
      </div>
      <div style={{ flex: "0 0 4px", backgroundColor: "skyblue" }}></div>
      <div style={{ flex: 1 }}>
        <QueryResponse value={jsonCode} />{" "}
      </div>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Dev />
  </React.StrictMode>,
  document.getElementById("root")
);
