import { DirectoryConfiguration, ExerciseConfig, EXERCISE_ERROR } from "../types";

async function getDirectoryContent(
  d: FileSystemDirectoryHandle,
  predicate: (f: FileSystemHandle) => Promise<boolean> | boolean = () => true,
) {
  const handles: FileSystemHandle[] = [];
  try {
    // @ts-ignore
    for await (const item of d.values()) {
      if (await predicate(item)) {
        handles.push(item);
      }
    }
  } catch (e) {
    console.log("Cannot read from directory ", d);
    console.error(e);
  }

  return handles;
}

const reImageExt = /(jpe?g|png|gif|bmp)$/;
async function isImage(f: FileSystemHandle) {
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

export async function writeFileIntoDirectory(
  d: FileSystemDirectoryHandle,
  fileName: string,
  content: string,
) {
  const newFile = await d.getFileHandle(fileName, {
    create: true,
  });
  const writable = await newFile.createWritable();
  await writable.write(content);
  await writable.close();
}

async function getFileContents(d: FileSystemDirectoryHandle, fileName: string) {
  const fileHandle = await d.getFileHandle(fileName, { create: true });
  const file = await fileHandle.getFile();
  return file.text();
}

function mapMediaToExercise(f: FileSystemFileHandle): ExerciseConfig {
  return {
    id: f.name,
    fileName: f.name,
    handle: f,
    text: "",
  };
}

function retrieveDirectoryImages(d: FileSystemDirectoryHandle) {
  return getDirectoryContent(d, isImage) as Promise<FileSystemFileHandle[]>;
}

function createDirectoryConfig(
  d: FileSystemDirectoryHandle,
  imageHandles: FileSystemFileHandle[],
): DirectoryConfiguration {
  return {
    folderName: d.name,
    exercises: imageHandles.map(mapMediaToExercise),
  };
}

function deserializeConfig(
  config: DirectoryConfiguration,
  media: FileSystemFileHandle[],
): DirectoryConfiguration {
  const filesToMatch = new Set(media.map((f) => f.name));
  const reconciledExercises: ExerciseConfig[] = [];

  for (const exercise of config.exercises) {
    let copy = { ...exercise };
    if (filesToMatch.has(exercise.fileName)) {
      filesToMatch.delete(exercise.fileName);
      copy.handle = media.find((f) => f.name === exercise.fileName)!;
    } else {
      copy.error = EXERCISE_ERROR.FILE_NOT_EXIST;
    }

    reconciledExercises.push(copy);
  }

  for (const fileName of filesToMatch) {
    reconciledExercises.push({
      handle: media.find((f) => f.name === fileName)!,
      id: fileName,
      fileName,
      text: "",
      error: EXERCISE_ERROR.NOT_IN_CONFIG,
    });
  }

  return {
    ...config,
    exercises: reconciledExercises,
  };
}

const CONFIG_FILE = "config.json";
export async function getDirectoryConfig(d: FileSystemDirectoryHandle) {
  let configContent = {};
  const directoryImages = await retrieveDirectoryImages(d);
  try {
    configContent = JSON.parse(await getFileContents(d, CONFIG_FILE));
    configContent = deserializeConfig(
      configContent as DirectoryConfiguration,
      directoryImages,
    );
  } catch (e) {
    configContent = createDirectoryConfig(d, directoryImages);
    await writeDirectoryConfig(d, configContent as DirectoryConfiguration);
  }

  return configContent as DirectoryConfiguration;
}

export async function writeDirectoryConfig(
  d: FileSystemDirectoryHandle,
  config: DirectoryConfiguration,
) {
  const saveConfig = {
    ...config,
    exercises: config.exercises.map(e => ({ ...e, error: undefined }))
  }

  return writeFileIntoDirectory(d, CONFIG_FILE, JSON.stringify(saveConfig));
}
