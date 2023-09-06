import React from "react";

import { sendMessage } from "./helpers/serviceWorkerTools";

type Context = {
  mainDirectoryHandle?: FileSystemDirectoryHandle;
  saveDirectoryHandle: (d: FileSystemDirectoryHandle) => void;
  isInitialized: () => boolean;
};

const GlobaContext = React.createContext<Context>({
  saveDirectoryHandle: () => {},
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

  return (
    <GlobaContext.Provider
      value={{
        mainDirectoryHandle: handle,
        saveDirectoryHandle,
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
