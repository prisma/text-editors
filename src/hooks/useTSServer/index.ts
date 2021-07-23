import { useEffect, useState } from "react";

import { TSServer } from "./tsserver";

export function useTSServer(code: string) {
  const tsserver = new TSServer();

  tsserver.init();
  // TODO:: Await openFile
  tsserver.openFile({
    name: "index.ts",
    content: code,
  });

  return tsserver;
}
