import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { Box, Card, CardBody, Flex, Image, Textarea } from "@chakra-ui/react";

const ITEM_TYPE = "EXERCISE_ITEM";

export function ExerciseItem({ file }: { file: FileSystemHandle }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const url = useFileUrl(file);
  const [_, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: console.log,
  });
  const [__, drag] = useDrag({
    type: ITEM_TYPE,
    item: () => {
      return { filename: file.name };
    },
  });
  drag(drop(ref));
  return (
    <Card ref={ref}>
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
}

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
