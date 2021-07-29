import { VercelRequest, VercelResponse } from "@vercel/node";
import { PCW, parseDatasourceUrl } from "@prisma/studio-pcw";

type RequestBody = {
  schema: string;
  query: string;
};

export default function types(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(400).send("Bad Request");
  }

  const { schema, query } = req.body as RequestBody;
  const pcw = new PCW(
    schema,
    "/tmp/schema.prisma",
    {},
    {
      resolve: {},
      forcePrismaLibrary: true,
    }
  );
  res.json({ query });
}
