import { useEffect } from "react";
import { TsWorker } from "../workers/ts-worker";

export function useTSWorker() {
  useEffect(() => {
    async function init() {
      const worker = new TsWorker();
      worker.init();
      worker.getCompletions();
    }

    init();
  });
}
