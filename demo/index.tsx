import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Editor, FileMap } from "../src/lib";

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

const ReactDemo = () => {
  const [code, setCode] = useState(tsCode);
  const [types, setTypes] = useState<FileMap>({});
  useEffect(() => {
    fetch("https://qc.prisma-adp.vercel.app/types/prisma-client.d.ts")
      .then(r => r.text())
      .then(fileContent => {
        console.log("Fetched Prisma Client types, injecting");
        setTypes({
          "/node_modules/@prisma/client/index.d.ts": fileContent,
        });
      })
      .catch(e => {
        console.log("Failed to fetch Prisma Client types:", e);
      });
  }, []);

  const [response, setResponse] = useState("");
  const runPrismaClientQuery = async (query: string) => {
    setResponse(JSON.stringify([{ loading: true }], null, 2));

    const res = await fetch("https://qc.prisma-adp.vercel.app/api/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { prisma: "prisma" } }),
    }).then(r => r.json());

    console.log("Received response", res.response);
    if (res.response.error) {
      setResponse(JSON.stringify([{ error: res.response.error }], null, 2));
    } else {
      setResponse(JSON.stringify(res.response.data, null, 2));
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "40px 1fr",
        gridTemplateColumns: "40px 50% 22px 50%",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <div
        style={{
          gridColumn: "1 / -1",
          gridRow: "1 / 2",
          zIndex: 10,
          boxShadow: "2px 0px 8px #0001",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ fontFamily: "JetBrains Mono", fontSize: 12 }}>
          This is only a demo of Prisma's text editors. To try out the query
          console, head over to the{" "}
          <a href="https://cloud.prisma.io" style={{ color: "#0EA5E9" }}>
            Prisma Data Platform
          </a>
        </p>
      </div>

      <div
        style={{
          gridColumn: "1 / 2",
          gridRow: "2 / -1",
          boxShadow: "2px 0px 8px #0001",
          zIndex: 2,
          borderRight: "1px solid #E2E8F0",
        }}
      ></div>
      <Editor
        lang="ts"
        types={types}
        value={code}
        style={{
          gridColumn: "2 / 3",
          gridRow: "2 / -1",
          boxShadow: "2px 0px 8px #0001",
          zIndex: 1,
          borderRight: "1px solid #E2E8F0",
        }}
        onChange={setCode}
        onExecuteQuery={runPrismaClientQuery}
      />

      <Editor
        lang="json"
        readonly
        value={response}
        style={{ gridColumn: "3 / -1", gridRow: "2 / -1" }}
      />
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <ReactDemo />
  </React.StrictMode>,
  document.getElementById("root")
);
