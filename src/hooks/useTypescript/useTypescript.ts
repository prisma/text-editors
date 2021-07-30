import {
  createSystem,
  createVirtualTypeScriptEnvironment,
  VirtualTypeScriptEnvironment,
} from "@typescript/vfs";
import { useEffect, useState } from "react";
import typescript from "typescript";
import { createFs } from "./createFs";
import { log } from "./log";

/** Map from fileName to fileContent */
export type FileMap = Record<string, string>;

interface ExtendedWindow extends Window {
  ts?: VirtualTypeScriptEnvironment;
}
declare const window: ExtendedWindow;

export function useTypescript(code: string, types?: FileMap) {
  const [ts, setTs] = useState<VirtualTypeScriptEnvironment>();

  useEffect(() => {
    (async () => {
      const fs = await createFs("4.3.5");

      log("Creating index.ts", { content: code });
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
      window.ts = ts;
    })();

    return () => {
      log("Destroying language service");
      ts?.languageService.dispose();
    };
  }, []);

  useEffect(() => {
    if (!ts || !types) {
      return;
    }

    log("Loading additional types");

    Object.entries(types).forEach(([fileName, fileContent]) => {
      ts?.createFile(fileName, fileContent);
    });
  }, [ts, types]);

  return ts;
}
