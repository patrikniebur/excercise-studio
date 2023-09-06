import React from "react";
import { Box, Card, CardBody, Flex, Image, Textarea } from "@chakra-ui/react";

type Props = { file: FileSystemHandle; isDragging?: boolean };

export const ExerciseItem = React.forwardRef<HTMLDivElement, Props>(
  ({ file, isDragging }, ref) => {
    const url = useFileUrl(file);

    return (
      <Card ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <CardBody>
          <Flex maxW="100%" overflow="hidden" gap="5">
            <Box flexBasis="30%">
              <Image src={url} alt={file.name} height="auto" />
            </Box>
            <Textarea placeholder={file.name} />
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
