import { View, Text, TouchableOpacity, TextInput } from "react-native";
import React, { useEffect } from "react";
import { useSettingStore } from "@store/store-settings";

type Props = {
  // closes the action bar
  closeActionBar: () => void;
  barHeight: number;
};
const PlaylistActionBar = ({ closeActionBar, barHeight }) => {
  const sleepTime = useSettingStore((state) => state.sleepTimeMinutes);
  const sleepStartDateTime = useSettingStore(
    (state) => state.sleepStartDateTime
  );
  const cancelCountdown = useSettingStore((state) => state.cancelSleepInterval);
  const sleepCountDown = useSettingStore((state) => state.sleepCountDown);
  const {
    updateSleepTime,
    startSleepTimer,
    runSleepCountdown,
    stopSleepTimer,
  } = useSettingStore((state) => state.actions);

  useEffect(() => {
    if (sleepStartDateTime && !cancelCountdown) {
      runSleepCountdown();
    }
    return () => {
      if (cancelCountdown) {
        console.log("running cancel countdown");
        cancelCountdown();
      }
    };
  }, [cancelCountdown]);

  const handleSleepTimeUpdate = (minutesString: string) => {
    const minutes = isNaN(parseInt(minutesString))
      ? 0
      : parseInt(minutesString);
    updateSleepTime(minutes);
  };

  return (
    <View
      className={`flex-row w-full justify-between items-center px-2 border h-[${barHeight}] `}
    >
      <Text>Sleep Timer - {sleepCountDown}</Text>
      <TextInput
        keyboardType="number-pad"
        onChangeText={handleSleepTimeUpdate}
        className="w-[30] h-[30] bg-white border p-1"
        value={sleepTime.toString()}
      />
      {sleepTime > 0 && !sleepStartDateTime && (
        <TouchableOpacity
          onPress={() => {
            startSleepTimer();
            runSleepCountdown();
          }}
        >
          <Text>Start</Text>
        </TouchableOpacity>
      )}
      {sleepStartDateTime && (
        <TouchableOpacity
          onPress={() => {
            stopSleepTimer();
          }}
        >
          <Text>Stop</Text>
        </TouchableOpacity>
      )}
      {/* <TouchableOpacity onPress={closeActionBar}>
        <Text>Close</Text>
      </TouchableOpacity> */}
    </View>
  );
};

export default PlaylistActionBar;
