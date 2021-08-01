import { compressToUTF16, decompressFromUTF16 } from "lz-string";
import { fileNames } from "./dts";
import { log } from "./log";

type FileName = string;
type FileContent = string;
type TSVersion = "4.3.5";

/**
 * A virtual file-system to manage files for the TS Language server
 */
export class TSFS {
  /** The version of Typescript this is using. Minimum supported version is 4.3.5 */
  private version: TSVersion;
  /** Base URL where core TS typedefs will be downloaded from */
  private cdnBaseUrl: string;
  /** Internal map of file names to their content */
  public fs: Map<FileName, FileContent>;

  constructor(version: TSVersion) {
    this.fs = new Map();
    this.version = version;
    this.cdnBaseUrl = "https://ts-cdn.prisma-adp.vercel.app";

    // Remove old cached things from `localStorage`
    Object.keys(localStorage).forEach(function (key) {
      // Remove anything that isn't from this version
      if (key.startsWith(`ts-lib/`) && !key.startsWith(`ts-lib/` + version)) {
        localStorage.removeItem(key);
      }
    });
  }

  async injectCoreLibs() {
    const fileNamesToFetch = fileNames[this.version];

    const libs = await Promise.all(
      fileNamesToFetch.map(fileName => {
        const cacheKey = `ts-lib/${this.version}/${fileName}`;

        const cachedFileContent = localStorage.getItem(cacheKey);
        if (cachedFileContent) {
          return Promise.resolve(decompressFromUTF16(cachedFileContent)!); // `!` is fine because we know compressed files are valid UTF16
        }

        return fetch(
          `${this.cdnBaseUrl}/typescript/${this.version}/${fileName}`
        )
          .then(r => r.text())
          .then(fileContent => {
            setTimeout(
              () =>
                localStorage.setItem(cacheKey, compressToUTF16(fileContent)),
              0
            );
            return fileContent;
          })
          .catch(e => {
            log(`Unable to fetch TS lib ${fileName}`, { error: e });
            throw new Error(`Unable to fetch TS lib ${fileName}`);
          });
      })
    );

    // Generate fsMap from TS libs
    libs.forEach((fileContent, i) =>
      this.fs.set(`/${fileNames[this.version][i]}`, fileContent)
    );
  }
}
