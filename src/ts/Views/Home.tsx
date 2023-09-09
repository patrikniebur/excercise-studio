import React from "react";
import { Heading, Grid, Flex, Button } from "@chakra-ui/react";
import { useNavigate } from "@tanstack/react-router";

import type { DirectoryConfiguration, ExerciseConfig } from "../types";
import { useGlobalContext } from "../GlobalContext";
import { ExerciseItem } from "../components/ExerciseItem";
import { Sortable } from "../components/Sortable/Sortable";
import {
  getDirectoryConfig,
  writeDirectoryConfig,
} from "../helpers/directoryFunctions";

export function Home() {
  const [config, setConfig, refresh] = useDirectoryConfiguration();
  const [orderedListing, setOrderedListing] = React.useState<ExerciseConfig[]>(
    [],
  );
  console.log({ config });
  const navigate = useNavigate();

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

  const onTextChange = (item: ExerciseConfig, newText: string) => {
    const exerciseIndex = config!.exercises.findIndex((e) => e.id === item.id);
    config!.exercises[exerciseIndex].text = newText;
    setConfig({ ...config! });
  };

  const onDelete = (item: ExerciseConfig) => {
    setConfig({
      ...config!,
      exercises: config!.exercises.filter(e => e.id !== item.id)
    })
  }

  return (
    <Flex
      w="100%"
      h="100%"
      maxH="100%"
      flexDirection="column"
      alignItems="center"
      gap="5"
    >
      <Heading as="h3">{config?.folderName}</Heading>
      <Button onClick={refresh}>Refresh</Button>
      <Grid templateColumns="repeat(3, 1fr)" gap={5}>
        <Sortable
          items={orderedListing}
          onReorder={onReorder}
          render={(item, ref, { isDragging }) => (
            <ExerciseItem
              ref={ref}
              exercise={item}
              isDragging={isDragging}
              onTextChange={(newText) => onTextChange(item, newText)}
              onDelete={() => onDelete(item)}
            />
          )}
        />
      </Grid>
      <Button onClick={() => navigate({ to: "exercise" })}>Run Exercise</Button>
    </Flex>
  );
}

function useDirectoryConfiguration() {
  const ctx = useGlobalContext();
  const [config, setConfig] = React.useState<DirectoryConfiguration>();
  const [refreshToken, setRefreshToken] = React.useState(0);

  React.useEffect(() => {
    if (!ctx.mainDirectoryHandle) {
      return;
    }

    getDirectoryConfig(ctx.mainDirectoryHandle).then(setConfig);
  }, [ctx.mainDirectoryHandle, refreshToken]);

  const updateConfig = (configUpdate: DirectoryConfiguration) => {
    if (!ctx.mainDirectoryHandle) {
      return;
    }

    writeDirectoryConfig(ctx.mainDirectoryHandle, configUpdate);
    setConfig(configUpdate);
  };

  const refresh = () => {
    setRefreshToken((x) => x + 1);
  };

  return [config, updateConfig, refresh] as const;
}
