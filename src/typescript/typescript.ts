import {
  createSystem,
  createVirtualTypeScriptEnvironment,
  VirtualTypeScriptEnvironment,
} from "@typescript/vfs";
import typescript from "typescript";
import { log } from "./log";
import { TSFS } from "./tsfs";

const TS_PROJECT_ENTRYPOINT = "index.ts";
export type FileMap = Record<string, string>;

/**
 * A representation of a Typescript project. Only supports single-file projects currently.
 */
export class TypescriptProject {
  private tsserver?: VirtualTypeScriptEnvironment;
  private fs: TSFS;

  constructor(entrypointFileContent: string) {
    this.fs = new TSFS("4.3.5");
    this.fs.fs.set(TS_PROJECT_ENTRYPOINT, entrypointFileContent);
  }

  get entrypoint() {
    return TS_PROJECT_ENTRYPOINT;
  }

  async init(): Promise<void> {
    await this.fs.injectCoreLibs();

    const system = createSystem(this.fs.fs);
    this.tsserver = createVirtualTypeScriptEnvironment(
      system,
      [TS_PROJECT_ENTRYPOINT],
      typescript,
      {
        target: typescript.ScriptTarget.ESNext,
      }
    );

    log("Initialized");
    window.ts = this.tsserver;
  }

  injectTypes(types: FileMap) {
    Object.entries(types).forEach(([name, content]) => {
      if (this.tsserver) {
        log("Injecting types to tsserver");
        // if tsserver has initialized, we must add files to it, modifying the FS will do nothing
        this.tsserver.createFile(name, content);
      } else {
        log("Injecting types to fs");
        // If tsserver has not initialized yet, we can add these types to the FS directly
        this.fs.fs.set(name, content);
      }
    });
  }

  async env(): Promise<VirtualTypeScriptEnvironment> {
    if (this.tsserver) return this.tsserver;

    await this.init();
    return this.tsserver!;
  }

  async lang(): Promise<VirtualTypeScriptEnvironment["languageService"]> {
    const env = await this.env();
    return env.languageService;
  }

  destroy() {
    log("Destroying language service");
    this.tsserver?.languageService.dispose();
    log("Destroying tsserver");
    this.tsserver = undefined;
  }
}

interface ExtendedWindow extends Window {
  ts?: VirtualTypeScriptEnvironment;
}
declare const window: ExtendedWindow;
