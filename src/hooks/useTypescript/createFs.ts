import { compressToUTF16, decompressFromUTF16 } from "lz-string";
import { log } from "../useTypescript/log";

const BASE_URL = "https://ts-cdn.prisma-adp.vercel.app";
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

/**
 * Returns a map of TS library definitions.
 * Definition files are cached by TS version. Network requests to fetch a file are only made if the file does not already exist in the cache.
 *
 * @param tsVersion
 * @returns
 */
export async function createFs(tsVersion: string) {
  const fs = new Map<string, string>();

  // First, we remove old cached things from `localStorage`
  Object.keys(localStorage).forEach(function (key) {
    // Remove anything that isn't from this version
    if (key.startsWith(`ts-lib/`) && !key.startsWith(`ts-lib/` + tsVersion)) {
      localStorage.removeItem(key);
    }
  });

  // Create a list of TS lib contents (either by downloading them or by restoring them from `localStorage`)
  const libs = await Promise.all(
    files.map(fileName => {
      const cacheKey = `ts-lib/${tsVersion}/${fileName}`;

      const cachedFileContent = localStorage.getItem(cacheKey);
      if (cachedFileContent) {
        return Promise.resolve(decompressFromUTF16(cachedFileContent)!); // `!` is fine because we know compressed files are valid UTF16
      }

      return fetch(`${BASE_URL}/typescript/${tsVersion}/${fileName}`, {
        method: "GET",
        headers: {
          "Accept-Encoding": "br",
        },
      })
        .then(r => r.text())
        .then(fileContent => {
          setTimeout(() => {
            log(`Caching ts lib ${fileName}`);
            localStorage.setItem(cacheKey, compressToUTF16(fileContent));
          }, 0);
          return fileContent;
        })
        .catch(e => {
          log(`Unable to fetch TS lib ${fileName}`, { error: e });
          throw new Error(`Unable to fetch TS lib ${fileName}`);
        });
    })
  );

  // Generate fsMap from TS libs
  libs.forEach((fileContent, i) => fs.set(`/${files[i]}`, fileContent));

  return fs;
}
