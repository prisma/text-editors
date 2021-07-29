import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import { QueryEditor } from "./components/QueryEditor";
import { QueryResponse } from "./components/QueryResponse";
import { FileMap } from "./hooks/useTypescriptEditor";
import "./index.css";

const tsCode: string = `import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

await prisma.user.findMany({

})
`;

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
  const [types, setTypes] = useState<FileMap>({});
  useEffect(() => {
    fetch("https://qc.prisma-adp.vercel.app/types/prisma-client.d.ts")
      .then(r => r.text())
      .then(fileContent => {
        setTypes({
          "/node_modules/@prisma/client/index.d.ts": fileContent,
        });
      });
  }, []);

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
        <QueryEditor
          mode="typescript"
          types={types}
          initialValue={tsCode}
          onChange={runQuery}
        />
        {/* <QueryEditor mode="sql" initialValue={sqlCode} /> */}
      </div>
      <div style={{ flex: "0 0 4px", backgroundColor: "skyblue" }}></div>
      <div style={{ flex: 1 }}>
        <QueryResponse initialValue={jsonCode} />{" "}
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
