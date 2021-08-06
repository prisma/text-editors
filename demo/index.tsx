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

// Top level queries
await prisma.artist.findMany()

await prisma.artist.findMany({
  where: {
    Name: {
      startsWith: "F"
    }
  }
})

await prisma.$queryRaw(\`SELECT * FROM "Album"\`)

// Invalid top-level query
const result = await prisma.invoice.create({
	data: {}
})

async function fn() {
  // Type error
  const y = 2
  y = "test"

  // Query inside function
  await prisma.genre.findMany()

  // $queryRaw inside function
  await prisma.$queryRaw(\`SELECT * FROM "Album"\`)

  // Variable declaration with query
  const result = await prisma.invoice.create({
    data: {}
	})

  return result
}

const arrowFn = async () => {
  const y = 2
  
  // Query inside arrow function
  await prisma.genre.findMany({ skip: 10 })
}
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

  const [theme, setTheme] = useState<ThemeName>("light");
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
        display: "grid",
        gridTemplateColumns: "40px 70% 30%",
        gridTemplateRows: "calc(50vh - 11px) 22px calc(50vh - 11px)",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <div
        style={{
          gridColumn: "1 / 2",
          gridRow: "1 / -1",
          boxShadow: "2px 0px 8px #0001",
          zIndex: 2,
          borderRight: "1px solid #E2E8F0",
        }}
      ></div>
      {queryMode === "typescript" && (
        <TSEditor
          types={types}
          theme={theme}
          value={tsCode}
          style={{
            gridColumn: "2 / 3",
          }}
          onExecuteQuery={runPrismaClientQuery}
        />
      )}
      {queryMode === "sql" && (
        <SQLEditor
          theme={theme}
          value={sqlCode}
          onExecuteQuery={runSqlQuery}
          style={{
            gridColumn: "2 / 3",
          }}
        />
      )}

      <PrismaSchemaEditor
        theme={theme}
        readonly
        value={prismaSchema}
        style={{ gridColumn: "3 / -1" }}
      />

      <div
        style={{
          gridColumn: "1 / -1",
          gridRow: "2 / 2",
          zIndex: 2,
          borderTop: "1px solid #E2E8F0",
          borderBottom: "1px solid #E2E8F0",
          background: "#F7FAFC",
          height: "100%",
        }}
      ></div>

      {/* <div style={{ flex: "0 0 1px", backgroundColor: "#666" }}></div> */}
      <JSONEditor
        theme={theme}
        readonly
        value={response}
        style={{ gridColumn: "2 / -1", gridRow: "3 / -1" }}
      />

      <div
        style={{
          position: "absolute",
          top: 10,
          right: "25vw",
          cursor: "pointer",
          zIndex: 9999999,
        }}
        onClick={flipTheme}
      >
        🌓
      </div>
      <div
        style={{
          position: "absolute",
          top: 10,
          right: "calc(25vw + 30px)",
          cursor: "pointer",
          zIndex: 9999999,
        }}
        onClick={flipQueryMode}
      >
        🔘
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
