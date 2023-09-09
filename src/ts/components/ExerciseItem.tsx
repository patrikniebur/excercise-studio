import React from "react";
import {
  Box,
  Card,
  CardBody,
  Flex,
  Image,
  Textarea,
  Text,
  CardProps,
  Badge,
  Button,
} from "@chakra-ui/react";

import { ExerciseConfig, EXERCISE_ERROR } from "../types";

type Props = {
  exercise: ExerciseConfig;
  isDragging?: boolean;
  onTextChange?: (text: string) => void;
  onDelete?: () => void
};

export const ExerciseItem = React.forwardRef<HTMLDivElement, Props>(
  ({ exercise, isDragging, onTextChange, onDelete }, ref) => {
    const url = useFileUrl(exercise.handle);

    const isEdit = onTextChange ? true : false;

    const styleProps: CardProps = isEdit
      ? {}
      : {
          width: "100%",
          height: "100%",
        };

    return (
      <Card ref={ref} opacity={isDragging ? 0.5 : 1} {...styleProps}>
        {exercise.error === EXERCISE_ERROR.NOT_IN_CONFIG && (
          <Badge colorScheme="green">NEW</Badge>
        )}
        <CardBody>
          <Flex
            maxW="100%"
            height="100%"
            width="100%"
            overflow="hidden"
            gap="10"
          >
            <Box flexBasis="50%">
              {exercise.error === EXERCISE_ERROR.FILE_NOT_EXIST ? (
                <>
                  <Text color="red.400">
                    File <Text as="code">{exercise.fileName}</Text> has not been
                    found
                  </Text>
                  { onDelete && <Button onClick={onDelete}>Delete</Button> }
                </>
              ) : (
                <Image
                  src={url}
                  alt={exercise.fileName}
                  width="100%"
                  height="100%"
                  objectFit="contain"
                />
              )}
            </Box>
            {onTextChange ? (
              <Textarea
                placeholder={exercise.fileName}
                onChange={(e) => onTextChange(e.target.value)}
                value={exercise.text}
              />
            ) : (
              <Text fontSize="5xl">{exercise.text}</Text>
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
    try {
      // @ts-ignore
      fileHandle.getFile().then((file: File) => {
        set(URL.createObjectURL(file));
      });
    } catch (e) {}
  }, [fileHandle]);

  return url;
}
