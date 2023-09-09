import {
  Button,
  Center,
  Heading,
  Stack,
  ButtonGroup,
  useToast,
  Badge,
} from "@chakra-ui/react";

import { useGlobalContext } from "../GlobalContext";
import { retrieveDirectoryHandle } from "../helpers/directoryFunctions";
import { sendMessage, useListenToSW } from "../helpers/serviceWorkerTools";
import React from "react";

export function Initialize() {
  const { saveDirectoryHandle } = useGlobalContext();
  const handles = useSWHandle();
  const toast = useToast();

  const showFolderError = () => {
    toast({
      colorScheme: "red",
      title: "Failed to retrieve access",
      description: "I cannot continue reading the folder, try again?",
      duration: 3000,
    });
  }

  const onClick = async () => {
    try {
      const d = await retrieveDirectoryHandle();
      saveDirectoryHandle(d);
    } catch (e) {
      showFolderError();
    }
  };

  const onFolderSelect = async (handle: FileSystemDirectoryHandle) => {
    try {
      // @ts-ignore - untyped requestPermission
      await handle.requestPermission()
      saveDirectoryHandle(handle)
    } catch(e) {
      showFolderError()
    }
  }

  return (
    <Center w="100%" h="100%" flexDirection="column">
      <Heading m="5">Start here</Heading>
      <Stack align="center">
        <Button colorScheme="blue" variant="solid" onClick={onClick}>
          Enable folder access
        </Button>
        <ButtonGroup>
          {handles.map(([handle, permission]) => (
            <Button key={handle.name} onClick={() => onFolderSelect(handle)}>
              {handle.name}
              <Badge
                margin="2"
                colorScheme={permission === "granted" ? "green" : ""}
              >
                {permission === "granted" ? "Allowed" : "Confirm"}
              </Badge>
            </Button>
          ))}
        </ButtonGroup>
      </Stack>
    </Center>
  );
}

function useSWHandle() {
  const [handles, setHandles] = React.useState<
    (readonly [FileSystemDirectoryHandle, string])[]
  >([]);

  const message = useListenToSW("FSHandles");

  React.useEffect(() => {
    sendMessage({ type: "RequestFSHandles" });
  }, []);

  React.useEffect(() => {
    if (!message) {
      return;
    }
    const fs: FileSystemDirectoryHandle[] = message.data;

    // @ts-ignore - untyped queryPermission
    Promise.all(fs.map((f) => f.queryPermission())).then(
      (permissionList: string[]) => {
        const filePermissionPairs = permissionList.map(
          (permission, i) => [fs[i], permission] as const,
        );
        setHandles(filePermissionPairs);
      },
    );
  }, [message]);

  return handles;
}
