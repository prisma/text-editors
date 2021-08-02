import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  FileMap,
  JSONEditor,
  PrismaSchemaEditor,
  SQLEditor,
  ThemeName,
  TSEditor,
} from "../src/lib";
/* @ts-expect-error */
import prismaSchema from "./prisma/schema.prisma?raw";

type QueryMode = "typescript" | "sql";

const tsCode: string = `import { PrismaClient } from "@prisma/client"

// PrismaClient initialization
const prisma = new PrismaClient()
// Irrelevant variable declaration
const x = 2;

con

async function abcd() {
  const y = 2
  y = "test"

  // Query inside function
  await prisma.user.findMany({
    where: {}
	})

  await prisma.$queryRaw(\`SELECT * FROM "User"\`)

  // Variable declaration with query
  const result = await prisma.user.create({
    data: {}
	})

  return result
}

const fn = async () => {
  const y = 2
  
  // Query inside arrow function
  await prisma.user.findMany({
    skip: 10
  })
}

// Top level query
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

const ReactDemo = () => {
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

  const [queryMode, setQueryMode] = useState<QueryMode>("typescript");
  const flipQueryMode = () => {
    if (queryMode === "typescript") setQueryMode("sql");
    else setQueryMode("typescript");
  };

  const [theme, setTheme] = useState<ThemeName>("dark");
  const flipTheme = () => {
    if (theme === "dark") setTheme("light");
    else setTheme("dark");
  };

  const [response, setResponse] = useState("[]");
  const runPrismaClientQuery = async (query: string) => {
    setResponse(JSON.stringify({ loading: true }, null, 2));

    const res = await fetch("https://qc.prisma-adp.vercel.app/api/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }).then(r => r.json());

    console.log("Received response", res.response);
    if (res.response.error) {
      setResponse(JSON.stringify({ error: res.response.error }, null, 2));
    } else {
      setResponse(JSON.stringify(res.response.data, null, 2));
    }
  };

  const runSqlQuery = (query: string) =>
    runPrismaClientQuery(`prisma.$queryRaw(\`${query}\`)`);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div style={{ flex: "1 0 0", display: "flex", position: "relative" }}>
        <div style={{ width: "70%" }}>
          {queryMode === "typescript" && (
            <TSEditor
              types={types}
              theme={theme}
              value={tsCode}
              onExecuteQuery={runPrismaClientQuery}
            />
          )}
          {queryMode === "sql" && (
            <SQLEditor value={sqlCode} onExecuteQuery={runSqlQuery} />
          )}

          <div
            style={{
              position: "absolute",
              top: 10,
              right: 20,
              cursor: "pointer",
            }}
            onClick={flipTheme}
          >
            🌓
          </div>
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 50,
              cursor: "pointer",
            }}
            onClick={flipQueryMode}
          >
            🔘
          </div>
        </div>
        <div style={{ width: "30%" }}>
          <PrismaSchemaEditor readonly value={prismaSchema} />
        </div>
      </div>
      <div style={{ flex: "0 0 1px", backgroundColor: "#666" }}></div>
      <div style={{ flex: "1 0 0" }}>
        <JSONEditor readonly value={response} />
      </div>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <ReactDemo />
  </React.StrictMode>,
  document.getElementById("root")
);
