/// <reference lib="WebWorker" />

// export empty type because of tsc --isolatedModules flag
export type {};
declare const self: ServiceWorkerGlobalScope;

import { MessageToSW, MessageFromSW } from "./ts/helpers/serviceWorkerTools";
import { storeHandle, getHandle } from "./ts/helpers/storage";

const DEBUG = true

function debug(message:unknown) {
  if (DEBUG) {
    console.log(message)
  }
}

const runtimeStorage = {
  handle: undefined as FileSystemDirectoryHandle | undefined,
};

self.addEventListener("activate", () => {
  debug("Claiming clients...");
  self.clients.claim();
});

self.addEventListener("message", async (e) => {
  const message = e.data as MessageToSW;
  const response = await getActionAndResponse(message)
  debug({ received: message, response })
  if (response) {
    e.source?.postMessage(response)
  }
});

async function getActionAndResponse(query: MessageToSW): Promise<MessageFromSW | undefined> {
  switch (query.type) {
    case "StoreFSHandle":
      runtimeStorage.handle = query.data;
      storeHandle(query.data)
      return;
    case "RequestFSHandle":
      const handle = runtimeStorage.handle || await getHandle()
      if (handle) {
        return { type: "FSHandle", data: handle };
      }
      return;
  }

  return undefined as never;
}
