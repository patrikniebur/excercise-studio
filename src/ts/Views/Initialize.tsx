import { Button, Center, Heading, useToast } from "@chakra-ui/react";

import { useGlobalContext } from "../GlobalContext";
import { retrieveDirectoryHandle } from "../helpers/directoryFunctions";
import { sendMessage, useListenToSW } from "../helpers/serviceWorkerTools";
import React from "react";

export function Initialize() {
  const { saveDirectoryHandle } = useGlobalContext();
  const [storedHandle, storedPermission] = useSWHandle();
  const toast = useToast();

  React.useEffect(() => {
    if (storedPermission === "granted" && storedHandle) {
      saveDirectoryHandle(storedHandle);
    }
  }, [storedHandle, storedPermission]);

  const onClick = async () => {
    try {
      const d = await (storedHandle
        ? // @ts-ignore
          storedHandle.requestPermission()
        : retrieveDirectoryHandle());
      saveDirectoryHandle(storedHandle ?? d);
    } catch (e) {
      console.error(e);
      toast({
        colorScheme: "red",
        title: "Failed to retrieve access",
        description: "I cannot continue reading the folder, try again?",
        duration: 3000,
      });
    }
  };

  return (
    <Center w="100%" h="100%" flexDirection="column">
      <Heading m="5">Start here</Heading>
      <Button colorScheme="blue" variant="solid" onClick={onClick}>
        Enable folder access
      </Button>
    </Center>
  );
}

function useSWHandle() {
  const [handle, setHandle] = React.useState<[FileSystemDirectoryHandle | null, string]>(
    [null, "unknown"],
  );

  const message = useListenToSW("FSHandle");

  React.useEffect(() => {
    sendMessage({ type: "RequestFSHandle" });
  }, []);

  React.useEffect(() => {
    if (!message) {
      return;
    }
    const fs: FileSystemDirectoryHandle = message.data;
    // @ts-ignore
    fs.queryPermission().then((permission) => {
      setHandle([fs, permission]);
    });
  }, [message]);

  return handle
}
