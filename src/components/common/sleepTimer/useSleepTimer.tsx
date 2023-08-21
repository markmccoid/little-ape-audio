import React, { useEffect } from "react";
import { useSettingStore } from "@store/store-settings";
//
const useSleepTimer = () => {
  const sleepStartDateTime = useSettingStore(
    (state) => state.sleepStartDateTime
  );
  const cancelCountdown = useSettingStore((state) => state.cancelSleepInterval);
  const { secondsLeft, formattedOutput } = useSettingStore(
    (state) => state.sleepCountDown
  );
  const { runSleepCountdown } = useSettingStore((state) => state.actions);

  // UseEffect start countdown IF it hasn't been started yet
  // and a sleep timer has been start
  useEffect(() => {
    // ONLY start the countdown IF the cancelCountdown function is undefined
    // and a timer is active.  We use the sleepStartDateTime field being populated
    // to indicate an active sleep timer
    if (sleepStartDateTime && !cancelCountdown) {
      runSleepCountdown();
    }
    // Clear the countdown interval if component unmounts
    return () => {
      if (cancelCountdown) {
        cancelCountdown();
      }
    };
  }, [cancelCountdown, sleepStartDateTime]);
  return {
    formattedOutput,
    secondsLeft,
  };
};

export default useSleepTimer;
