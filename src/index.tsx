import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { EditorMode, QueryEditor, ThemeName } from "./components/QueryEditor";
import { QueryResponse } from "./components/QueryResponse";
import { FileMap } from "./hooks/useTypescriptEditor/useTypescriptEditor";
import "./index.css";

const tsCode: string = `import { PrismaClient } from "@prisma/client"

// PrismaClient initialization
const prisma = new PrismaClient()
// Irrelevant variable declaration
const x = 2;

async function abcd() {
  const y = 2

  // Query inside function
  await prisma.user.findMany({

	})

  // Variable declaration with query
  const result = await prisma.user.findMany({

	})

  return result
}

const fn = async () => {
  const y = 2
  
  // Query inside function
  await prisma.user.findMany({
  
  })
  
  // Variable declaration with query
  const result = await prisma.user.findMany({
  
  })
  
  return result
}

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
  const runQuery = (query: string) => {
    setResponse("[]");
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
            initialValue={tsCode}
            onChange={runQuery}
          />
        )}
        {queryMode === "sql" && (
          <QueryEditor mode="sql" initialValue={sqlCode} />
        )}
      </div>
      <div style={{ flex: "0 0 1px", backgroundColor: "#666" }}></div>
      <div style={{ flex: 1 }}>
        <QueryResponse initialValue={response} />
      </div>

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
