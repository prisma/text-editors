import {
  ChangeRequestArgs,
  CompletionDetailsRequestArgs,
  CompletionDetailsResponse,
  CompletionInfoResponse,
  CompletionsRequestArgs,
  OpenRequestArgs,
} from "typescript/lib/protocol";

type Protocol = {
  open: { request: OpenRequestArgs; response: void };
  change: { request: ChangeRequestArgs; response: void };
  completionInfo: {
    request: CompletionsRequestArgs;
    response: CompletionInfoResponse;
  };
  completionEntryDetails: {
    request: CompletionDetailsRequestArgs;
    response: CompletionDetailsResponse;
  };
};

export type Command = keyof Protocol;
export type RequestArgs<T extends Command> = Protocol[T]["request"];
export type ResponseArgs<T extends Command> = Protocol[T]["response"];

export type Request<T extends Command> = {
  seq: number;
  type: "request";
  command: T;
  arguments: RequestArgs<T>;
};
export type Response<T extends Command> = {
  seq: number;
  request_seq: number;
  success: boolean;
  type: "response";
  command: T;
  message: string;
};
