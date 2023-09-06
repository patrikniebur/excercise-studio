import React from "react";
import { Button, Grid, Flex } from "@chakra-ui/react";

import { useGlobalContext } from "../GlobalContext";
import { ExerciseItem } from "../components/ExerciseItem";
import { Sortable } from "../components/Sortable/Sortable";
import { getDirectoryContent, isImage } from "../helpers/directoryFunctions";

type SortableItem = {
  id: string
  file: FileSystemFileHandle;
}

export function Home() {
  const [listing, refreshListing] = useDirectoryListing();
  const [orderedListing, setOrderedListing] = React.useState<SortableItem[]>([]);

  React.useEffect(() => {
    setOrderedListing(listing.map((item) => ({ file: item, id: item.name })));
  }, [listing]);

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
        <Sortable
          items={orderedListing}
          onReorder={(items) => setOrderedListing(items)}
          render={(item, ref, { isDragging }) => (
            <ExerciseItem ref={ref} file={item.file} isDragging={isDragging} />
          )}
        />
      </Grid>
    </Flex>
  );
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
