import {
  Button,
  Text,
  Center,
  Heading,
  Stack,
  ButtonGroup,
  useToast,
  Badge,
} from "@chakra-ui/react";

import { useGlobalContext } from "../GlobalContext";
import {
  retrieveDirectoryHandle,
  hasSupport,
} from "../helpers/directoryFunctions";
import { sendMessage, useListenToSW } from "../helpers/serviceWorkerTools";
import React from "react";

export function Initialize() {
  const [isInstallable, install] = useIsInstallable();
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
  };

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
      await handle.requestPermission();
      saveDirectoryHandle(handle);
    } catch (e) {
      showFolderError();
    }
  };

  const body = (
    <>
      <Heading m="5">Start here</Heading>
      <Stack align="center">
        <ButtonGroup mb="5">
          <Button colorScheme="blue" variant="solid" onClick={onClick}>
            Enable folder access
          </Button>
          {isInstallable && (
            <Button colorScheme="purple" onClick={install}>
              Install app
            </Button>
          )}
        </ButtonGroup>
        {handles.length > 0 && (
          <Heading as="h2" size="md">
            Previously opened folders
          </Heading>
        )}
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
    </>
  );

  return (
    <Center w="100%" h="100%" flexDirection="column">
      {hasSupport() ? (
        body
      ) : (
        <Text>
          Unfortunately your browser does not support APIs this experimental app
          is based on. Please use latest chrome if you want to try the app.
        </Text>
      )}
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

function useIsInstallable() {
  const prompt = React.useRef<{ prompt: Function }>();
  const [installable, setInstallable] = React.useState(false);

  React.useEffect(() => {
    const listener = (e: Event) => {
      e.preventDefault();
      setInstallable(true);
      // @ts-ignore missing typings for event
      prompt.current = e;
    };
    window.addEventListener("beforeinstallprompt", listener);

    return () => window.removeEventListener("beforeinstallprompt", listener);
  }, []);

  const promptInstall = () => {
    prompt.current?.prompt();
  };

  return [installable, promptInstall] as const;
}
