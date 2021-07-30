import { PrismaClient } from "@prisma/client";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { brotliCompressSync, deflateSync, gzipSync } from "zlib";

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
  const response = JSON.stringify({
    query,
    response: await new AsyncFunction("prisma", `return await ${query}`)(
      prisma
    ),
  });
  await prisma.$disconnect();

  res.setHeader("Content-Type", "application/json");

  // Naive implementation, but good enough for a demo lol
  const acceptsEncoding = req.headers["accept-encoding"];
  if (acceptsEncoding?.includes("br")) {
    return res
      .setHeader("Content-Encoding", "br")
      .send(brotliCompressSync(Buffer.from(response, "utf-8")));
  } else if (acceptsEncoding?.includes("gzip")) {
    return res
      .setHeader("Content-Encoding", "gzip")
      .send(gzipSync(Buffer.from(response, "utf-8")));
  } else if (acceptsEncoding?.includes("gzip")) {
    return res
      .setHeader("Content-Encoding", "deflate")
      .send(deflateSync(Buffer.from(response, "utf-8")));
  } else {
    return res.json({ query, response: response });
  }
}
