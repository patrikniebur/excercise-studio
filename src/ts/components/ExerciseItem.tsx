import React from "react";
import {
  Box,
  Card,
  CardBody,
  Flex,
  Image,
  Textarea,
  Text,
} from "@chakra-ui/react";

import { ExerciseConfig } from "../types";

type Props = {
  exercise: ExerciseConfig;
  isDragging?: boolean;
  onTextChange?: (text: string) => void;
};

export const ExerciseItem = React.forwardRef<HTMLDivElement, Props>(
  ({ exercise, isDragging, onTextChange }, ref) => {
    const url = useFileUrl(exercise.handle);

    return (
      <Card ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <CardBody>
          <Flex maxW="100%" overflow="hidden" gap="5">
            <Box flexBasis="30%">
              <Image src={url} alt={exercise.fileName} height="auto" />
            </Box>
            {onTextChange ? (
              <Textarea
                placeholder={exercise.fileName}
                onChange={(e) => onTextChange(e.target.value)}
                value={exercise.text}
              />
            ) : (
              <Text>{exercise.text}</Text>
            )}
          </Flex>
        </CardBody>
      </Card>
    );
  },
);

ExerciseItem.displayName = "ExerciseItem";

function useFileUrl(fileHandle: FileSystemHandle) {
  const [url, set] = React.useState<string>();
  React.useEffect(() => {
    // @ts-ignore
    fileHandle.getFile().then((file: File) => {
      set(URL.createObjectURL(file));
    });
  }, [fileHandle]);

  return url;
}
