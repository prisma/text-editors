import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  FileMap,
  JSONEditor,
  SQLEditor,
  ThemeName,
  TSEditor,
} from "../src/lib";

type QueryMode = "typescript" | "sql";

const tsCode: string = `import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

await prisma.artist.findMany({})

await prisma.artist.findMany({
  where: {
    Name: {
      startsWith: "F"
    }
  }
})

const fn = async (value: string) => {
\tconst x = 1
\tawait prisma.album.findUnique({ where: { id: 1 } })
}

await prisma.$executeRaw(\`SELECT * FROM "Album"\`)

async function fn(value: string) {
\tconst x = 1

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

  const [response, setResponse] = useState<Record<string, any>[]>([]);
  const runPrismaClientQuery = async (query: string) => {
    setResponse([{ loading: true }]);

    const res = await fetch("https://qc.prisma-adp.vercel.app/api/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { prisma: "prisma" } }),
    }).then(r => r.json());

    console.log("Received response", res.response);
    if (res.response.error) {
      setResponse([{ error: res.response.error }]);
    } else {
      setResponse(res.response.data);
    }
  };

  const runSqlQuery = (query: string) =>
    runPrismaClientQuery(`prisma.$queryRaw(\`${query}\`)`);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "40px 50% 22px 50%",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <div
        style={{
          gridColumn: "1 / 2",
          // gridRow: "1 / -1",
          boxShadow: "2px 0px 8px #0001",
          zIndex: 2,
          borderRight: "1px solid #E2E8F0",
        }}
      ></div>
      {queryMode === "typescript" && (
        <TSEditor
          types={types}
          theme={theme}
          initialValue={tsCode}
          style={{
            gridColumn: "2 / 3",
            boxShadow: "2px 0px 8px #0001",
            zIndex: 1,
            borderRight: "1px solid #E2E8F0",
          }}
          onExecuteQuery={runPrismaClientQuery}
        />
      )}
      {queryMode === "sql" && (
        <SQLEditor
          theme={theme}
          initialValue={sqlCode}
          onExecuteQuery={runSqlQuery}
          style={{
            gridColumn: "2 / 3",
            boxShadow: "2px 0px 8px #0001",
            zIndex: 2,
            borderRight: "1px solid #E2E8F0",
          }}
        />
      )}

      <div
        style={{
          gridColumn: "3 / 4",
          gridRow: "1 / -1",
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
        initialValue={response}
        value={response}
        style={{ gridColumn: "3 / -1", gridRow: "1 / -1" }}
      />

      {/* <div
        style={{
          position: "absolute",
          top: 10,
          right: "29vw",
          cursor: "pointer",
          zIndex: 9999999,
        }}
        onClick={flipTheme}
      >
        🌓
      </div> */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: "calc(50vw - 60px)",
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
