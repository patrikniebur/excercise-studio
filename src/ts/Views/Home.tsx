import React from "react";
import { Button, Grid, Flex } from "@chakra-ui/react";

import { useGlobalContext } from "../GlobalContext";
import { ExerciseItem } from "../components/ExerciseItem";
import { Sortable } from "../components/Sortable/Sortable";
import { getDirectoryContent, isImage } from "../helpers/directoryFunctions";

export function Home() {
  const [config, setConfig] = useDirectoryConfiguration();
  const [orderedListing, setOrderedListing] = React.useState<ExerciseConfig[]>(
    [],
  );

  React.useEffect(() => {
    setOrderedListing(config?.exercises ?? []);
  }, [config?.exercises]);

  const onReorder = (items: ExerciseConfig[]) => {
    setOrderedListing(items);
    setConfig({
      ...config!,
      exercises: items,
    });
  };

  return (
    <Flex
      w="100%"
      h="100%"
      maxH="100%"
      flexDirection="column"
      alignItems="center"
      gap="5"
    >
      <Button>Refresh content</Button>
      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        <Sortable
          items={orderedListing}
          onReorder={onReorder}
          render={(item, ref, { isDragging }) => (
            <ExerciseItem
              ref={ref}
              file={item.handle}
              isDragging={isDragging}
            />
          )}
        />
      </Grid>
    </Flex>
  );
}

type ExerciseConfig = {
  id: string;
  handle: FileSystemFileHandle;
  text: string;
  error?: string;
};

type DirectoryConfiguration = {
  folderName: string;
  exercises: ExerciseConfig[];
};

function useDirectoryConfiguration() {
  const [directoryListing, refreshDirectoryListing] = useDirectoryListing();
  const [exercises, setExercise] = React.useState<ExerciseConfig[]>([]);
  const [config, setConfig] = useDirectoryConfigFile();

  React.useEffect(() => {
    if (!directoryListing || !config) {
      return;
    }
    asyncFilter<FileSystemHandle, FileSystemFileHandle>(
      directoryListing,
      isImage,
    ).then((files) => {
      const exercises = reconcileFilesToConfig(config, files);
      setExercise(exercises);
    });
  }, [directoryListing, config]);

  const interimConfig = React.useMemo(() => {
    return { ...config!, exercises };
  }, [config, exercises]);

  return [interimConfig, setConfig] as const;
}

function useDirectoryConfigFile() {
  const configFileHandle = React.useRef<FileSystemFileHandle>();
  const [config, setConfig] = React.useState<DirectoryConfiguration>();
  const [directoryListing, , mainDirectoryHandle] = useDirectoryListing();

  React.useEffect(() => {
    if (directoryListing.length === 0 || !mainDirectoryHandle) {
      return;
    }
    // Retrieve the config file
    asyncFilter<FileSystemHandle, FileSystemFileHandle>(
      directoryListing,
      async (item) => item.name === "config.json",
    )
      .then(([configFile]) => {
        if (!configFile) {
          // if the config does not exist create an empty value and write to it
          const config: DirectoryConfiguration = {
            folderName: mainDirectoryHandle!.name,
            exercises: [],
          };
          mainDirectoryHandle
            .getFileHandle("config.json", { create: true })
            .then((fileHandle) => {
              configFileHandle.current = fileHandle;
              fileHandle.createWritable().then((writable) => {
                writable.write(JSON.stringify(config)).then(() => {
                  writable.close();
                });
              });
            });
          return config;
        }

        configFileHandle.current = configFile;
        /* retrieve the config object */
        return configFile
          .getFile()
          .then((f) => f.text())
          .then((configString) => {
            return JSON.parse(configString);
          });
      })
      .then((config) => {
        recoverConfig(config, mainDirectoryHandle).then((c) => setConfig(c));
      });
  }, [directoryListing]);

  function updateConfig(config: DirectoryConfiguration) {
    configFileHandle.current!.createWritable().then((writable) => {
      writable.write(JSON.stringify(config)).then(() => writable.close());
    });
    setConfig(config);
  }

  // return config object and method to update it
  return [config, updateConfig] as const;
}

function useDirectoryListing() {
  const [listing, setListing] = React.useState<FileSystemHandle[]>();
  const [refreshToken, setRefreshToken] = React.useState(true);

  const { mainDirectoryHandle } = useGlobalContext();
  React.useEffect(() => {
    getDirectoryContent(mainDirectoryHandle!).then((content) => {
      setListing(content);
    });
  }, [mainDirectoryHandle, refreshToken]);

  return [
    listing ?? [],
    () => setRefreshToken((x) => !x),
    mainDirectoryHandle,
  ] as const;
}

async function asyncFilter<T extends unknown, Value extends T>(
  arr: Array<T>,
  predicate: (item: T) => Promise<boolean>,
): Promise<Value[]> {
  const results = await Promise.all(arr.map(predicate));
  // @ts-ignore
  return arr.filter((_v, index) => results[index]);
}

function reconcileFilesToConfig(
  config: DirectoryConfiguration,
  files: FileSystemFileHandle[],
): ExerciseConfig[] {
  const filesToMatch = new Set(files.map(f => f.name));
  const reconciledExercises: ExerciseConfig[] = [];

  for (const exercise of config.exercises) {
    let copy = { ...exercise };
    if (filesToMatch.has(exercise.handle.name)) {
      filesToMatch.delete(exercise.handle.name);
    } else {
      copy.error = "FILE_NOT_EXIST";
    }

    reconciledExercises.push(exercise);
  }

  for (const fileName of filesToMatch) {
    reconciledExercises.push({
      handle: files.find(f => f.name === fileName)!,
      id: fileName,
      text: "",
      error: "NOT_IN_CONFIG",
    });
  }

  return reconciledExercises;
}

async function recoverConfig(
  config: DirectoryConfiguration,
  folderHandle: FileSystemDirectoryHandle,
) {
  const exercises = await Promise.all(
    config.exercises.map((e) => {
      return folderHandle
        .getFileHandle(e.id)
        .then((handle) => ({ ...e, handle }));
    }),
  );

  return {
    ...config,
    exercises,
  };
}
