import { VercelRequest, VercelResponse } from "@vercel/node";

export default function types(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(400).send("Bad Request");
  }

  const { query } = req.body;
  res.json({ query });
  res.send("ok");
}
