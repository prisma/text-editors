import TSServer from "typescript/lib/tsserver?worker";

type TSServerProtocol = {
  open: { file: string };
  completions: {
    file: string;
    line: number;
    offset: number;
  };
};
type TSServerCommand = keyof TSServerProtocol;
type TSServerRequestArgs<T extends TSServerCommand> = TSServerProtocol[T];

type TSServerRequest<T extends TSServerCommand> = {
  seq: number;
  type: "request";
  command: T;
  arguments: TSServerRequestArgs<T>;
};
type TSServerResponse<T extends TSServerCommand> = {
  seq: number;
  req_seq: number;
  success: boolean;
  type: "response";
  command: T;
  message: string;
};

let idCounter = 0;

export class TsWorker {
  private tsserver: Worker;

  constructor() {
    this.tsserver = new TSServer();
    this.tsserver.addEventListener("message", this.onTSServerMessage);
  }

  private onTSServerMessage<T extends TSServerCommand>(
    msg: MessageEvent<TSServerResponse<T>>
  ) {
    console.log(msg.data);
  }

  private sendMessage<T extends TSServerCommand>(
    command: T,
    args: TSServerRequestArgs<T>
  ) {
    // TODO:: Return Promise
    this.tsserver.postMessage({
      seq: ++idCounter,
      type: "request",
      command,
      arguments: args,
    });
  }

  init() {
    // Initialize tsserver with arguments. This must always be the first message.
    this.tsserver.postMessage([]);
    console.log("[ts-worker] Initialized");
  }

  openFile() {
    return this.sendMessage("open", {
      file: "/Users/siddhant/Code/query-console/src/index.d.ts",
    });
  }

  getCompletions() {
    return this.sendMessage("completions", {
      file: "/Users/siddhant/Code/lens/src/index.d.ts",
      line: 1,
      offset: 0,
    });
  }
}
