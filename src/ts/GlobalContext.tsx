import React from "react";

import { sendMessage } from "./helpers/serviceWorkerTools";

type Context = {
  mainDirectoryHandle?: FileSystemDirectoryHandle;
  saveDirectoryHandle: (d: FileSystemDirectoryHandle) => void;
  clearDirectoryHandle: () => void;
  isInitialized: () => boolean;
};

const noop = () => {}

const GlobaContext = React.createContext<Context>({
  saveDirectoryHandle: noop,
  clearDirectoryHandle: noop,
  isInitialized: () => false,
});

export function GlobalContextProvider({ children }: React.PropsWithChildren) {
  const [handle, setHandle] = React.useState<FileSystemDirectoryHandle>();

  const isInitialized = () => {
    return handle !== undefined;
  };

  const saveDirectoryHandle = (data: FileSystemDirectoryHandle) => {
    sendMessage({ type: "StoreFSHandle", data });
    setHandle(data);
  };

  const clearDirectoryHandle = () => {
    setHandle(undefined)
  }

  return (
    <GlobaContext.Provider
      value={{
        mainDirectoryHandle: handle,
        saveDirectoryHandle,
        clearDirectoryHandle,
        isInitialized,
      }}
    >
      {children}
    </GlobaContext.Provider>
  );
}

export function useGlobalContext() {
  const context = React.useContext(GlobaContext);
  if (!context) {
    throw Error("Using GlobalContext outside the provider");
  }

  return context;
}
