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
  const [config, setConfig] = useDirectoryConfiguration();
  const [orderedListing, setOrderedListing] = React.useState<ExerciseConfig[]>(
    [],
  );
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
    setConfig(config!);
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
      <Heading as="h3">{config?.folderName}</Heading>
      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        <Sortable
          items={orderedListing}
          onReorder={onReorder}
          render={(item, ref, { isDragging }) => (
            <ExerciseItem
              ref={ref}
              exercise={item}
              isDragging={isDragging}
              onTextChange={(newText) => onTextChange(item, newText)}
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

  React.useEffect(() => {
    if (!ctx.mainDirectoryHandle) {
      return;
    }

    getDirectoryConfig(ctx.mainDirectoryHandle).then(setConfig);
  }, [ctx.mainDirectoryHandle]);

  const updateConfig = (configUpdate: DirectoryConfiguration) => {
    if (!ctx.mainDirectoryHandle) {
      return;
    }

    writeDirectoryConfig(ctx.mainDirectoryHandle, configUpdate);
    setConfig(configUpdate);
  };

  return [config, updateConfig] as const;
}
