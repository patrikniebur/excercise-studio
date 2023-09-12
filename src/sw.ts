/// <reference lib="WebWorker" />

// export empty type because of tsc --isolatedModules flag
export type {};
declare const self: ServiceWorkerGlobalScope;
import { manifest, version } from "@parcel/service-worker";

import { MessageToSW, MessageFromSW } from "./ts/helpers/serviceWorkerTools";
import { storeHandle, getHandle } from "./ts/helpers/storage";

const DEBUG = true;

function debug(...message: unknown[]) {
  if (DEBUG) {
    console.log(...message);
  }
}

const runtimeStorage = {
  handles: [] as FileSystemDirectoryHandle[],
};

/* MAKE STUFF AVAILABLE OFFLINE */
async function installCaches() {
  const cache = await caches.open(version);
  debug({ manifest });
  await cache.addAll(manifest);
}
self.addEventListener("install", (e) => e.waitUntil(installCaches()));

async function activate() {
  const keys = await caches.keys();
  await Promise.all([
    ...keys.map((key) => key !== version && caches.delete(key)),
    self.clients.claim(),
  ]);
}

self.addEventListener("activate", (e) => e.waitUntil(activate()));

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.open(version).then(function (cache) {
      return cache.match(event.request).then(function (response) {
        debug("Network", { response, request: event.request });
        return (
          response ||
          fetch(event.request).then(function (response) {
            cache.put(event.request, response.clone());
            return response;
          })
        );
      });
    }),
  );
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
