import React from "react";
import {
  Heading,
  Flex,
  Button,
  Box,
  ButtonProps,
  Progress,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";

import type { DirectoryConfiguration } from "../types";
import { useGlobalContext } from "../GlobalContext";
import { ExerciseItem } from "../components/ExerciseItem";
import { getDirectoryConfig } from "../helpers/directoryFunctions";
import { useVoiceCommands, useKeyboardControls } from "../helpers/hooks";
import { VoiceControlledTimer } from "../components/Timer/VoiceControlledTimer";

export function ExerciseRunner() {
  useKeyboardControls({ ArrowLeft: prev, ArrowRight: next });
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

  function prev() {
    setCurrentExerciseIndex((i) => (isFirst ? i : i - 1));
  }
  function next() {
    setCurrentExerciseIndex((i) => (isLast ? i : i + 1));
  }

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

  const arrowProps: ButtonProps = {
    pos: "absolute",
    bottom: "10",
    size: "lg",
  };

  return (
    <Flex
      w="100%"
      h="100%"
      maxH="100%"
      flexDirection="column"
      alignItems="center"
      gap="5"
      padding="10"
    >
      <Box width="100%">
        <Link style={{ float: "right" }} to="/">
          Back to editor
        </Link>
        <Heading as="h3" textAlign="center" mb="3">
          {config?.folderName}
        </Heading>
      </Box>
      {currentExercise && (
        <Box w="100%" h="100%" pos="relative">
          <Progress
            pos="absolute"
            w="100%"
            zIndex="banner"
            max={config?.exercises.length}
            min={1}
            value={currentExerciseIndex + 1}
            mb="1"
            borderRadius="5"
          />
          <ExerciseItem exercise={currentExercise} />
        </Box>
      )}
      <Box position="absolute" left="10" right="10" bottom="0">
        {isFirst === false && (
          <Button {...arrowProps} left="0" onClick={prev}>
            &lt;
          </Button>
        )}
        {isLast === false && (
          <Button {...arrowProps} right="0" onClick={next}>
            &gt;
          </Button>
        )}
      </Box>
      <Box
        position="absolute"
        bottom="2"
        background="gray.600"
        borderRadius="full"
      >
        <VoiceControlledTimer />
      </Box>
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
