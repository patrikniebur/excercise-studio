import React from "react";

import { Timer } from "./Timer";
import { useVoiceCommands } from "../../helpers/hooks";

export function VoiceControlledTimer() {
  const [resetKey, setResetKey] = React.useState(0);
  const [lastCommand] = useVoiceCommands([
    "start",
    "stop",
    "reset",
    "pause",
    "pose" /* pose - catches misunderstood pause */,
  ]);

  React.useEffect(() => {
    if (["reset", "stop"].includes(lastCommand)) {
      setResetKey((x) => x + 1);
    }
  }, [lastCommand]);

  return <Timer key={resetKey} run={lastCommand === "start"} />;
}
