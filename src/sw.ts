/// <reference lib="WebWorker" />

// export empty type because of tsc --isolatedModules flag
export type {};
declare const self: ServiceWorkerGlobalScope;

import { MessageToSW, MessageFromSW } from "./ts/helpers/serviceWorkerTools";
import { storeHandle, getHandle } from "./ts/helpers/storage";

const DEBUG = true;

function debug(message: unknown) {
  if (DEBUG) {
    console.log(message);
  }
}

const runtimeStorage = {
  handles: [] as FileSystemDirectoryHandle[],
};

self.addEventListener("activate", () => {
  debug("Claiming clients...");
  self.clients.claim();
});

self.addEventListener("message", async (e) => {
  const message = e.data as MessageToSW;
  const response = await getActionAndResponse(message);
  debug({ received: message, response });
  if (response) {
    e.source?.postMessage(response);
  }
});

async function getActionAndResponse(
  query: MessageToSW,
): Promise<MessageFromSW | undefined> {
  switch (query.type) {
    case "StoreFSHandle":
      const handleMatches = await Promise.all(
        runtimeStorage.handles.map((h) => h.isSameEntry(query.data)),
      );
      if (handleMatches.includes(true) === false) {
        runtimeStorage.handles.push(query.data);
        storeHandle(runtimeStorage.handles);
      }
      return;
    case "RequestFSHandles":
      runtimeStorage.handles = (await getHandle()) ?? [];
      if (runtimeStorage.handles.length > 0) {
        return { type: "FSHandles", data: runtimeStorage.handles };
      }
      return;
  }

  return undefined as never;
}
