import { VercelRequest, VercelResponse } from "@vercel/node";
import { PrismaClient } from "@prisma/client";
import { gzipSync } from "zlib";

type RequestBody = {
  schema: string;
  query: string;
};

export default async function types(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(400).send("Bad Request");
  }

  const { query } = req.body as RequestBody;

  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

  const prisma = new PrismaClient();
  const response = await new AsyncFunction("prisma", `return await ${query}`)(
    prisma
  );
  await prisma.$disconnect();

  const gzippedResponse = gzipSync(Buffer.from(response, "utf-8"));

  return res.json({ query, response: gzippedResponse });
}
