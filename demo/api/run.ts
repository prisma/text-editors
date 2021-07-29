import * as fs from "fs";
import * as path from "path";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { PCW, parseDatasourceUrl } from "@prisma/studio-pcw";

type RequestBody = {
  schema: string;
  query: string;
};

const DB_URL = process.env.DB_URL as string;

export default async function types(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(400).send("Bad Request");
  }

  const { query } = req.body as RequestBody;
  const schemaPath = path.resolve(
    "../node_modules/.prisma/client/schema.prisma"
  );
  const schema = fs.readFileSync(schemaPath, "utf-8");
  const { env } = parseDatasourceUrl(schema);

  const pcw = new PCW(
    schema,
    schemaPath,
    {
      [`${env}`]: DB_URL,
    },
    {
      forcePrismaLibrary: true,
    }
  );

  res.json({ query, response: await pcw.request(query) });
}
