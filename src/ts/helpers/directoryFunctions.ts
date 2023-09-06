export async function getDirectoryContent(d: FileSystemDirectoryHandle) {
  const handles: FileSystemHandle[] = [];
  try {
    // @ts-ignore
    for await (const item of d.values()) {
      handles.push(item);
    }
  } catch (e) {
    console.log('Cannot read from directory ', d)
    console.error(e);
  }

  return handles;
}

const reImageExt = /(jpe?g|png|gif|bmp)$/;
export async function isImage(f: FileSystemHandle) {
  if (f.kind === "file" && reImageExt.test(f.name)) {
    // @ts-ignore
    const file: File = await f.getFile();
    return file.type.startsWith("image");
  }

  return false;
}

export async function retrieveDirectoryHandle() {
  try {
    const directoryHandle: FileSystemDirectoryHandle =
      // @ts-ignore
      await window.showDirectoryPicker({
        id: "exercise_library_folder",
        mode: "readwrite",
      });
    return directoryHandle;
  } catch (e) {
    throw Error("Directory not retrieved");
  }
}

export async function retrieveDirectoryEntry(e: React.DragEvent) {
  e.preventDefault();
  const items = e.dataTransfer.items;
  return items[0].webkitGetAsEntry() as FileSystemDirectoryEntry;
}

export async function writeFileIntoDirectory(d: FileSystemDirectoryHandle) {
  const newFile = await d.getFileHandle("config.json", {
    create: true,
  });
  const writable = await newFile.createWritable();
  await writable.write(JSON.stringify({ config: true, written: "success" }));
  await writable.close();
}

export function getDirectoryImageUrl(d: FileSystemDirectoryEntry) {
  const reader = d.createReader();
  reader.readEntries((entries) => {
    const file = entries[0] as FileSystemFileEntry;
    for (const entry in entries) {
      console.log({ entry });
    }
  });
}
