import * as fs from "fs";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { PCW, parseDatasourceUrl } from "@prisma/studio-pcw";

type RequestBody = {
  schema: string;
  query: string;
};

const DB_URL = process.env.DB_URL;

export default function types(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(400).send("Bad Request");
  }

  const { schema, query } = req.body as RequestBody;
  const { env } = parseDatasourceUrl(schema);

  fs.writeFileSync("/tmp/schema.prisma", schema, "utf-8");
  const pcw = new PCW(
    schema,
    "/tmp/schema.prisma",
    {
      [env]: DB_URL,
    },
    {
      forcePrismaLibrary: true,
    }
  );
  res.json({ query });
}
