import { useEffect, useState } from "react";
import {
  createSystem,
  createVirtualTypeScriptEnvironment,
  VirtualTypeScriptEnvironment,
} from "@typescript/vfs";
import typescript from "typescript";

import { createFs } from "./createFs";

export function useTypescript(code: string) {
  const [ts, setTs] = useState<VirtualTypeScriptEnvironment>();

  useEffect(() => {
    (async () => {
      const fs = await createFs();
      fs.set("index.ts", code);

      const system = createSystem(fs);
      const env = createVirtualTypeScriptEnvironment(
        system,
        ["index.ts"],
        typescript,
        {
          target: typescript.ScriptTarget.ESNext,
        }
      );
      setTs(env);

      return system;
    })();

    return () => {
      ts?.languageService.dispose();
    };
  }, []);

  return ts;
}
