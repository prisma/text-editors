import {
  ChangeRequestArgs,
  CloseRequest,
  CompletionDetailsRequestArgs,
  CompletionDetailsResponse,
  CompletionInfoResponse,
  CompletionsRequestArgs,
  ConfigureRequestArguments,
  ConfigureResponse,
  GeterrForProjectRequestArgs,
  OpenRequestArgs,
  QuickInfoRequest,
  QuickInfoResponse,
  SetCompilerOptionsForInferredProjectsArgs,
  SetCompilerOptionsForInferredProjectsResponse,
  UpdateOpenRequestArgs,
} from "typescript/lib/protocol";

type Protocol = {
  configure: {
    request: ConfigureRequestArguments;
    response: ConfigureResponse;
  };
  compilerOptionsForInferredProjects: {
    request: SetCompilerOptionsForInferredProjectsArgs;
    response: SetCompilerOptionsForInferredProjectsResponse;
  };

  open: { request: OpenRequestArgs; response: void };
  updateOpen: { request: UpdateOpenRequestArgs; response: void };
  change: { request: ChangeRequestArgs; response: void };
  close: { request: CloseRequest["arguments"]; response: void };

  quickinfo: {
    request: QuickInfoRequest["arguments"];
    response: QuickInfoResponse;
  };
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
