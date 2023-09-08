import React from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export function useVoiceCommands(command: string[]) {
    const [lastCommand, setLastCommand] = React.useState("");
    const { transcript, resetTranscript } = useSpeechRecognition({
      commands: [
        {
          command,
          callback: (lastCommand) => {
            setLastCommand(lastCommand);
            resetTranscript();
          },
          matchInterim: true,
          isFuzzyMatch: true,
        },
      ],
    });
  
    if (location.hash.includes("debug")) {
      console.log({ transcript, lastCommand });
    }
  
    React.useEffect(() => {
      // Timeout fixes error during development when listenning attempted to start
      // before it has been aborted in a cleanup
      setTimeout(
        () => SpeechRecognition.startListening({ continuous: true }),
        500,
      );
  
      return () => {
        SpeechRecognition.abortListening();
      };
    }, []);

    const reset = () => {
        setLastCommand("")
        resetTranscript()
    }
  
    return [lastCommand, reset] as const;
  }
  