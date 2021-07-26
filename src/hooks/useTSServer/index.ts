import { useEffect, useState } from "react";

import { TSServer } from "./tsserver";

export function useTSServer(code: string) {
  const tsserver = new TSServer();

  useEffect(() => {
    (async () => {
      await tsserver.init();
      await tsserver.openFile({
        content: code,
      });
    })();

    return () => {
      tsserver.destroy();
    };
  });

  return tsserver;
}
