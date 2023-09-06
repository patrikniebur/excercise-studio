import React from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import { Timer } from "./Timer";
import * as style from "./styles.module.css";

export function VoiceControlledTimer() {
  const [resetKey, setResetKey] = React.useState(0);
  const lastCommand = useVoiceCommands();

  React.useEffect(() => {
    if (["reset", "stop"].includes(lastCommand)) {
      setResetKey((x) => x + 1);
    }
  }, [lastCommand]);

  return <Timer key={resetKey} run={lastCommand === "start"} />;
}

function useVoiceCommands() {
  const [lastCommand, setLastCommand] = React.useState("");
  const { transcript, resetTranscript } = useSpeechRecognition({
    commands: [
      {
        command: [
          "start",
          "stop",
          "reset",
          "pause",
          "pose" /* pose - catches misunderstood pause */,
        ],
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

  return lastCommand;
}
