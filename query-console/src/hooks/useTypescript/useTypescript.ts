import {
  createSystem,
  createDefaultMapFromCDN,
  createVirtualTypeScriptEnvironment,
  createDefaultMapFromNodeModules,
} from "@typescript/vfs";
import ts from "typescript";
import { useEffect, useState } from "react";

const files = [
  "lib.d.ts",
  "lib.dom.d.ts",
  "lib.dom.iterable.d.ts",
  "lib.es2015.collection.d.ts",
  "lib.es2015.core.d.ts",
  "lib.es2015.d.ts",
  "lib.es2015.generator.d.ts",
  "lib.es2015.iterable.d.ts",
  "lib.es2015.promise.d.ts",
  "lib.es2015.proxy.d.ts",
  "lib.es2015.reflect.d.ts",
  "lib.es2015.symbol.d.ts",
  "lib.es2015.symbol.wellknown.d.ts",
  "lib.es2016.array.include.d.ts",
  "lib.es2016.d.ts",
  "lib.es2016.full.d.ts",
  "lib.es2017.d.ts",
  "lib.es2017.full.d.ts",
  "lib.es2017.intl.d.ts",
  "lib.es2017.object.d.ts",
  "lib.es2017.sharedmemory.d.ts",
  "lib.es2017.string.d.ts",
  "lib.es2017.typedarrays.d.ts",
  "lib.es2018.asyncgenerator.d.ts",
  "lib.es2018.asynciterable.d.ts",
  "lib.es2018.d.ts",
  "lib.es2018.full.d.ts",
  "lib.es2018.intl.d.ts",
  "lib.es2018.promise.d.ts",
  "lib.es2018.regexp.d.ts",
  "lib.es2019.array.d.ts",
  "lib.es2019.d.ts",
  "lib.es2019.full.d.ts",
  "lib.es2019.object.d.ts",
  "lib.es2019.string.d.ts",
  "lib.es2019.symbol.d.ts",
  "lib.es2020.bigint.d.ts",
  "lib.es2020.d.ts",
  "lib.es2020.full.d.ts",
  "lib.es2020.intl.d.ts",
  "lib.es2020.promise.d.ts",
  "lib.es2020.sharedmemory.d.ts",
  "lib.es2020.string.d.ts",
  "lib.es2020.symbol.wellknown.d.ts",
  "lib.es2021.d.ts",
  "lib.es2021.full.d.ts",
  "lib.es2021.promise.d.ts",
  "lib.es2021.string.d.ts",
  "lib.es2021.weakref.d.ts",
  "lib.es5.d.ts",
  "lib.es6.d.ts",
  "lib.esnext.d.ts",
  "lib.esnext.full.d.ts",
  "lib.esnext.intl.d.ts",
  "lib.esnext.promise.d.ts",
  "lib.esnext.string.d.ts",
  "lib.esnext.weakref.d.ts",
  "lib.scripthost.d.ts",
  "lib.webworker.d.ts",
  "lib.webworker.importscripts.d.ts",
  "lib.webworker.iterable.d.ts",
];

async function importDefaultDefinitions() {
  const fs = new Map<string, string>();

  const definitions = await Promise.all(
    files.map(f => import(/* @vite-ignore */ `typescript/lib/${f}?raw`))
  );
  definitions.forEach((d, i) => {
    fs.set(files[i], d);
  });

  return fs;
}

export function useTypescript(code: string) {
  const [env, setEnv] = useState<any>();

  useEffect(() => {
    (async () => {
      const fs = await importDefaultDefinitions();
      // const fsMap = new Map<string, string>();
      // fsMap.set("lib.es2015.d.ts", libEs2015);
      // fsMap.set("lib.es2015.collection.d.ts", libEs2015Collection);
      // fsMap.set("lib.es2015.core.d.ts", libEs2015Core);
      // fsMap.set("lib.es2015.generator.d.ts", libEs2015Generator);
      // fsMap.set("lib.es2015.iterable.d.ts", libEs2015Iterable);
      // fsMap.set("lib.es2015.promise.d.ts", libEs2015Promise);
      // fsMap.set("lib.es2015.proxy.d.ts", libEs2015Proxy);
      // fsMap.set("lib.es2015.reflect.d.ts", libEs2015Reflect);
      // fsMap.set("lib.es2015.symbol.d.ts", libEs2015Symbol);
      // fsMap.set("lib.es2015.symbol.wellknown.d.ts", libEs2015SymbolWellknown);
      // fsMap.set("lib.es5.d.ts", libEs5);

      // const fsMap = createDefaultMapFromNodeModules({
      //   target: ts.ScriptTarget.ES5,
      // });

      // const fsMap = await createDefaultMapFromCDN(
      //   { target: ts.ScriptTarget.ES2017 },
      //   "3.7.3",
      //   true,
      //   ts
      // );

      fs.set("index.ts", code);

      const system = createSystem(fs);

      const e = createVirtualTypeScriptEnvironment(system, ["index.ts"], ts, {
        target: ts.ScriptTarget.ES2017,
      });
      setEnv(e);

      // You can then interact with the languageService to introspect the code
      console.log(
        e.getSourceFile("index.ts")?.getLineAndCharacterOfPosition(218),
        e.languageService.getCompletionsAtPosition("index.ts", 97, {
          // disableSuggestions: true,
          // includeCompletionsWithInsertText: true,
        })
        // ?.entries.filter(e => e.name === "heroku")
      );

      return system;
    })();
  }, []);

  return env;
}
