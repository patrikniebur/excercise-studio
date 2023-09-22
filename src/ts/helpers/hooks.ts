import React from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useWakeLock } from "react-screen-wake-lock";

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
    setLastCommand("");
    resetTranscript();
  };

  return [lastCommand, reset] as const;
}

export function useKeyboardControls(
  listeners: Record<string, undefined | (() => void)>,
) {
  React.useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const callback = listeners[e.code];
      if (callback) {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener("keydown", listener);

    return () => window.removeEventListener("keydown", listener);
  }, [listeners]);
}

export function useRefreshingWakeLock() {
  const locked = React.useRef(false);
  const { request, release } = useWakeLock({
    onRelease: () => {
      locked.current = false;
    },
  });

  const lock = () => {
    if (locked.current !== true) {
      request().then(() => {
        locked.current = true;
      });
    }
  };

  /* Lock/unlock on component mount/unmount */
  React.useEffect(() => {
    lock();

    return () => {
      if (locked.current) {
        release().then(() => {
          locked.current = false;
        });
      }
    };
  }, []);

  /* Re-lock after visibility change */
  React.useEffect(() => {
    const listener = () => {
      if (document.visibilityState === "visible" && locked.current === false) {
        lock();
      }
    };
    window.addEventListener("visibilitychange", listener);

    return () => {
      window.removeEventListener("visibilitychange", listener);
    };
  }, []);
}
