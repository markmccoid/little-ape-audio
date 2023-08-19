import React, { useEffect } from "react";
import { useSettingStore } from "@store/store-settings";

const useSleepTimer = () => {
  const sleepTime = useSettingStore((state) => state.sleepTimeMinutes);
  const sleepStartDateTime = useSettingStore(
    (state) => state.sleepStartDateTime
  );
  const cancelCountdown = useSettingStore((state) => state.cancelSleepInterval);
  const { secondsLeft } = useSettingStore((state) => state.sleepCountDown);
  const countdownActive = useSettingStore((state) => state.countdownActive);
  const { startSleepTimer, runSleepCountdown } = useSettingStore(
    (state) => state.actions
  );

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
        console.log("running cancel countdown");
        cancelCountdown();
      }
    };
  }, [cancelCountdown, sleepStartDateTime]);
  return {
    countdownActive,
    secondsLeft,
  };
};

export default useSleepTimer;
