import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { EditorMode, QueryEditor, ThemeName } from "./components/QueryEditor";
import { FileMap } from "./editor/editor";
import "./index.css";

const tsCode: string = `import { PrismaClient } from "@prisma/client"

// PrismaClient initialization
const prisma = new PrismaClient()
// Irrelevant variable declaration
const x = 2;

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

  const [queryMode, setQueryMode] = useState<EditorMode>("typescript");
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
  const runQuery = async (query: string) => {
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
        {queryMode === "typescript" && (
          <QueryEditor
            mode="typescript"
            types={types}
            theme={theme}
            initialValue={tsCode}
            onExecuteQuery={runQuery}
          />
        )}
        {queryMode === "sql" && (
          <QueryEditor mode="sql" initialValue={sqlCode} />
        )}
      </div>
      <div style={{ flex: "0 0 1px", backgroundColor: "#666" }}></div>
      {/* <div style={{ flex: 1 }}>
        <QueryResponse initialValue={response} />
      </div> */}

      <div
        style={{ position: "fixed", top: 10, right: 20, cursor: "pointer" }}
        onClick={flipTheme}
      >
        🌓
      </div>
      <div
        style={{ position: "fixed", top: 10, right: 50, cursor: "pointer" }}
        onClick={flipQueryMode}
      >
        🔘
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
