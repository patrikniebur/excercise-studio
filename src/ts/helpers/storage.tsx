import localforage from "localforage";
import React from "react";

localforage.config({
  driver: localforage.INDEXEDDB,
  name: "exercise-studio",
  version: 1.0,
});

const FS_KEY = "DIRECTORY_HANDLES";

export function storeHandle(d: FileSystemDirectoryHandle[]) {
  localforage.setItem(FS_KEY, d);
}

export function getHandle() {
  return localforage.getItem<FileSystemDirectoryHandle[]>(FS_KEY)
}