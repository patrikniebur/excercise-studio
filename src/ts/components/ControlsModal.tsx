import {
  Modal,
  Button,
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Tag,
  Text,
  VStack,
  Kbd,
} from "@chakra-ui/react";

export function ControlsModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen}>?</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Controls</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack alignItems="flex-start" mb="4">
              <Text as="strong">Keyboard:</Text>
              <Text>
                <Kbd>LeftArrow</Kbd> Previous exercise
              </Text>
              <Text>
                <Kbd>RightArrow</Kbd> Next exercise
              </Text>
              <Text>
                <Kbd>Space</Kbd> Start / Pause the timer
              </Text>
              <Text>
                <Kbd>R / S</Kbd> Stop and reset the timer
              </Text>
            </VStack>
            <VStack alignItems="flex-start">
              <Text as="strong">Speech 🗣️</Text>
              <Text>
                <Tag>Previous</Tag> or <Tag>Back</Tag> - Previous exercise
              </Text>
              <Text>
                <Tag>Forward</Tag> or <Tag>Next</Tag> - Next exercise
              </Text>
              <Text>
                <Tag>Start</Tag> - Start the timer
              </Text>
              <Text>
                <Tag>Pause</Tag> - Pause the timer
              </Text>
              <Text>
                <Tag>Stop</Tag> or <Tag>Reset</Tag> - Stop and reset the timer
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
