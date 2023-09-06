import React from "react";

export type MessageToSW = {
  type: "StoreFSHandle";
  data: FileSystemDirectoryHandle;
} | { type: "RequestFSHandle" };

export type MessageFromSW = {
  type: "FSHandle";
  data: FileSystemDirectoryHandle;
};

export function registerSW() {
  navigator.serviceWorker.register(new URL("../../sw.ts", import.meta.url), {
    type: "module",
  });
}

function getSW() {
  return new Promise<ServiceWorker>((resolve) => {
    if (navigator.serviceWorker.controller) {
      resolve(navigator.serviceWorker.controller);
      return;
    }
    const listener = () => {
      resolve(navigator.serviceWorker.controller!);
      setTimeout(() =>
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          listener,
        ),
      );
    };

    navigator.serviceWorker.addEventListener("controllerchange", listener);
  });
}

export async function sendMessage(message: MessageToSW) {
  const sw = await getSW();
  sw.postMessage(message);
}

export async function listenToMessage(type: MessageFromSW["type"], callback: (message: MessageFromSW) => void) {
  const sw = await getSW();
  const listener = (message: MessageEvent<MessageFromSW>) => {
    if (message.data.type === type) {
        callback(message.data)
    }
    // @ts-ignore
    setTimeout(() => navigator.serviceWorker.removeEventListener("message", listener));
};

// @ts-ignore
  navigator.serviceWorker.addEventListener("message", listener);
}

export function useListenToSW(type: MessageFromSW["type"]) {
    const [message, setMessage] = React.useState<MessageFromSW>()
    listenToMessage(type, setMessage)

    return message
}
