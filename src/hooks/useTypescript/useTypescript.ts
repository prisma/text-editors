import { useEffect, useState } from "react";
import {
  createSystem,
  createVirtualTypeScriptEnvironment,
  VirtualTypeScriptEnvironment,
} from "@typescript/vfs";
import typescript from "typescript";

import { log } from "./log";
import { createFs } from "./createFs";

export function useTypescript(code: string) {
  const [ts, setTs] = useState<VirtualTypeScriptEnvironment>();

  useEffect(() => {
    (async () => {
      const fs = await createFs("4.3.5");
      fs.set("index.ts", code);

      const system = createSystem(fs);
      const env = createVirtualTypeScriptEnvironment(
        system,
        ["index.ts"],
        typescript,
        {
          noEmit: true,
          target: typescript.ScriptTarget.ESNext,
        }
      );
      setTs(env);

      log("Initialized");

      return system;
    })();

    return () => {
      ts?.languageService.dispose();
    };
  }, []);

  return ts;
}
