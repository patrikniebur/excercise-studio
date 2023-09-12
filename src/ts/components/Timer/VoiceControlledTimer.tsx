import React from "react";

import { Timer } from "./Timer";
import { useVoiceCommands, useKeyboardControls } from "../../helpers/hooks";

export function VoiceControlledTimer() {
  const [resetKey, setResetKey] = React.useState(0);
  const [run, setRun] = React.useState(false);
  useKeyboardControls({
    "Space": toggle,
    "KeyR": reset,
    "KeyS": reset,
  })
  const voiceCommandMap = [
    { keys: ["reset", "stop"], command: reset },
    { keys: ["start"], command: start },
    { keys: ["pause", "pose", "post"], command: () => toggle(false) },
  ];
  const [lastCommand] = useVoiceCommands(voiceCommandMap.map((c) => c.keys).flat());

  React.useEffect(() => {
    for (const command of voiceCommandMap) {
      if (command.keys.includes(lastCommand)) {
        command.command()
        return;
      }
    }
  }, [lastCommand]);

  function reset() {
    setRun(false)
    setResetKey((x) => x + 1);
  }

  function start() {
    setRun(true);
  }

  function toggle(set?: boolean) {
    setRun(set ?? !run);
  }

  return <Timer key={resetKey} run={run} />;
}
