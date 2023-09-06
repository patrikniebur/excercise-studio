import React from "react";
import { Button, Grid, Flex } from "@chakra-ui/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { useGlobalContext } from "../GlobalContext";
import { ExerciseItem } from "../components/ExerciseItem";
import { getDirectoryContent, isImage } from "../helpers/directoryFunctions";

export function Home() {
  const [listing, refreshListing] = useDirectoryListing();

  return (
    <Flex
      w="100%"
      h="100%"
      maxH="100%"
      flexDirection="column"
      alignItems="center"
      gap="5"
    >
      <Button onClick={refreshListing}>Refresh content</Button>
      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        <DndProvider backend={HTML5Backend}>
          <ExercisePlannerStudio listing={listing} />
        </DndProvider>
      </Grid>
    </Flex>
  );
}

function ExercisePlannerStudio({ listing }: { listing: FileSystemHandle[] }) {
  return listing.map((imageFile) => (
    <ExerciseItem key={imageFile.name} file={imageFile} />
  ));
}

function useDirectoryListing() {
  const [listing, setListing] = React.useState<FileSystemFileHandle[]>();
  const [refreshToken, setRefreshToken] = React.useState(true);

  const { mainDirectoryHandle } = useGlobalContext();
  React.useEffect(() => {
    getDirectoryContent(mainDirectoryHandle!).then((content) => {
      asyncFilter(content, isImage).then((filtered) => {
        setListing(filtered as FileSystemFileHandle[]);
      });
    });
  }, [mainDirectoryHandle, refreshToken]);

  return [listing ?? [], () => setRefreshToken((x) => !x)] as const;
}

async function asyncFilter<T extends unknown>(
  arr: Array<T>,
  predicate: (item: T) => Promise<boolean>,
) {
  const results = await Promise.all(arr.map(predicate));

  return arr.filter((_v, index) => results[index]);
}
