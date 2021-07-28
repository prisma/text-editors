import TSServerWorker from "typescript/lib/tsserver?worker";
import { log } from "./log";
import type { Command, Response, RequestArgs, ResponseArgs } from "./types";

type ReplyQueueItem = {
  resolve: (value: Response<Command>) => void;
  reject: () => void;
};

let seqCounter = 0;
let file = "index.ts";

export class TSServer {
  private tsserver: Worker;
  private _responseQueue: Map<number, ReplyQueueItem>;

  constructor() {
    this.tsserver = new TSServerWorker();
    this.tsserver.addEventListener("message", this.onTSServerMessage);

    this._responseQueue = new Map();
  }

  private onTSServerMessage = <T extends Command>(
    msg: MessageEvent<Response<T>>
  ) => {
    log("Received message", msg.data);
    const response = this._responseQueue.get(msg.data.request_seq);

    if (!response) {
      return;
    }

    this._responseQueue.delete(msg.data.request_seq);
    response.resolve(msg.data);
  };

  private sendMessage<T extends Command>(
    command: T,
    args: RequestArgs<T>
  ): Promise<ResponseArgs<T>> {
    return new Promise((resolve, reject) => {
      const seq = ++seqCounter;
      this._responseQueue.set(seq, { resolve, reject });

      const message = {
        seq,
        type: "request",
        command,
        arguments: args,
      };

      log("sendMessage:", message);
      this.tsserver.postMessage(message);
    });
  }

  async init() {
    log("Initializing");

    // Initialize tsserver with arguments. This must always be the first message.
    this.tsserver.postMessage([
      "--serverMode",
      "partialsemantic", // `syntactic`, `partialsemantic` or `semantic` (unsupported in webworkers)
      "--logVerbosity",
      "3", // 0 = terse, 1 = normal, 2 = requestTime, 3 = verbose
    ]);

    await this.sendMessage("configure", {
      hostInfo: "Prisma Query Console v0.0.1",
    });
    await this.sendMessage("compilerOptionsForInferredProjects", {
      options: {
        strict: true,
        lib: ["lib.dom.d.ts", "lib.dom.iterable.d.ts", "lib.esnext.d.ts"],
        allowJs: false,
        skipLibCheck: true,
        allowSyntheticDefaultImports: true,
        isolatedModules: true,
        noEmit: true,
      },
    });
  }

  destroy() {
    return this.sendMessage("close", {
      file,
    });
  }

  openFile({ content }: { content: string }) {
    // tsserver does not respond for an `open` request, which means this will always stay in `_responseQueue`, but that's okay
    this.sendMessage("open", {
      file,
      fileContent: content,
      scriptKindName: "TS",
    });

    return Promise.resolve();
  }

  updateFile(line: number, offset: number) {
    return this.sendMessage("change", {
      file,
      line,
      offset,
      endLine: line,
      endOffset: offset,
      insertString: "",
    });
  }

  updateOpen(content: string) {
    return this.sendMessage("updateOpen", {
      openFiles: [
        {
          file,
          fileContent: content,
        },
      ],
    });
  }

  /** Returns method definitions, variable types, or other things that are supposed to show up when you hover over an identifier, keyword, or anythng really */
  getQuickInfo(line: number, offset: number) {
    return this.sendMessage("quickinfo", {
      file,
      line,
      offset,
    });
  }

  /** Returns a list of possible words / phrases that you might want to type, given a location in a file */
  async getCompletions(line: number, offset: number) {
    const completions = await this.sendMessage("completionInfo", {
      file,
      line,
      offset,
    });

    if (!completions.body || completions.body.entries.length === 0) {
      log("Unable to get completions", { completions });
      throw new Error("[tsserver] Unable to get completions");
    }

    return this.sendMessage("completionEntryDetails", {
      file,
      line,
      offset,
      entryNames: completions.body?.entries
        .filter(e => e.kind !== "keyword" && e.kind !== "module")
        .map(e => ({
          name: e.name,
          source: e.source,
          data: e.data,
        })),
    });
  }
}
