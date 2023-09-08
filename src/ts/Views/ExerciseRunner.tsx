import React from "react";
import { Heading, Flex, Button, Box } from "@chakra-ui/react";

import type { DirectoryConfiguration } from "../types";
import { useGlobalContext } from "../GlobalContext";
import { ExerciseItem } from "../components/ExerciseItem";
import { getDirectoryConfig } from "../helpers/directoryFunctions";
import { useVoiceCommands } from "../helpers/hooks";
import { VoiceControlledTimer } from "../components/Timer/VoiceControlledTimer";

export function ExerciseRunner() {
  const [config] = useDirectoryConfiguration();
  const [currentExerciseIndex, setCurrentExerciseIndex] = React.useState(0);
  const [lastCommand, resetLastCommand] = useVoiceCommands([
    "next",
    "forward",
    "back",
    "previous",
  ]);

  const isFirst = currentExerciseIndex === 0;
  const isLast = currentExerciseIndex + 1 === (config?.exercises?.length ?? 0);

  const prev = () => setCurrentExerciseIndex((i) => isFirst ? i : i - 1 );
  const next = () => setCurrentExerciseIndex((i) => isLast ? i : i + 1);

  React.useEffect(() => {
    if (["back", "previous"].includes(lastCommand)) {
      prev();
    }
    if (["next", "forward"].includes(lastCommand)) {
      next();
    }
    if (lastCommand !== "") {
      resetLastCommand();
    }
  }, [lastCommand]);

  const currentExercise = config?.exercises[currentExerciseIndex];
  console.log({currentExerciseIndex})


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
      {currentExercise && <ExerciseItem exercise={currentExercise} />}
      <Box>
        {isFirst === false && <Button onClick={prev}>&lt;</Button>}
        {isLast === false && <Button onClick={next}>&gt;</Button>}
      </Box>
      <VoiceControlledTimer />
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

  return [config] as const;
}
