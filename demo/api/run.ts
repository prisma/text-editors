import { VercelRequest, VercelResponse } from "@vercel/node";
import { PrismaClient } from "@prisma/client";

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
  prisma.$disconnect();

  return res.json({ query, response });
}
