import * as fs from "fs";
import * as path from "path";
import { gzipSync } from "zlib";
import { VercelRequest, VercelResponse } from "@vercel/node";

export default function types(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(400).send("Bad Request");
  }

  const types = fs.readFileSync(
    path.resolve("../node_modules/.prisma/client/index.d.ts")
  );
  const gzippedTypes = gzipSync(types);

  res.setHeader("Content-Encoding", "gzip").send(gzippedTypes);
}
