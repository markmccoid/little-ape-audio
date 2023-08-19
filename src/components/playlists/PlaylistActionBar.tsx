import { View, Text, TouchableOpacity, TextInput } from "react-native";
import React, { useEffect } from "react";
import { useSettingStore } from "@store/store-settings";
import { AnimatePresence, MotiText, MotiView } from "moti";
import TimerCountdown from "@components/common/sleepTimer/TimerCountdown";

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
  const countdownActive = useSettingStore((state) => state.countdownActive);
  const { updateSleepTime, startSleepTimer, stopSleepTimer } = useSettingStore(
    (state) => state.actions
  );

  const handleSleepTimeUpdate = (minutesString: string) => {
    const minutes = isNaN(parseInt(minutesString))
      ? 0
      : parseInt(minutesString);
    updateSleepTime(minutes);
  };

  return (
    <View
      className={`flex-row  justify-start items-center px-2 border h-[${barHeight}] `}
    >
      <Text>Sleep Timer Minutes {sleepTime}</Text>
      <TimerCountdown />

      {/* <AnimatePresence exitBeforeEnter>
        {Boolean(sleepStartDateTime) && (
          <MotiView
            key="countdown"
            className="w-[50] h-[30] bg-red-400 border-red-500"
          >
            <Text className="p-1 text-center">{formattedOutput || "..."}</Text>
          </MotiView>
        )}
        {!Boolean(sleepStartDateTime) && (
          <MotiView
            key="input"
            className="w-[30] h-[30] bg-white border"
            from={{ opacity: 0.5, width: 30 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 1000,
            }}
            exit={{ opacity: 0, width: 50 }}
            exitTransition={{
              type: "timing",
              duration: 1000,
            }}
          >
            <TextInput
              keyboardType="number-pad"
              onChangeText={handleSleepTimeUpdate}
              // className="w-[30] h-[30] bg-white border p-1 text-center"
              className="p-1 text-center"
              value={sleepTime.toString()}
              editable={!Boolean(sleepStartDateTime)}
            />
          </MotiView>
        )}
      </AnimatePresence>*/}
      <TextInput
        keyboardType="number-pad"
        onChangeText={handleSleepTimeUpdate}
        className="w-[30] h-[30] bg-white border p-1 text-center"
        // className="p-1 text-center"
        value={sleepTime.toString()}
        editable={!Boolean(sleepStartDateTime)}
      />
      <View className="flex-row justify-end flex-grow">
        {!countdownActive && sleepTime > 0 && (
          <TouchableOpacity
            onPress={() => {
              startSleepTimer();
              // runSleepCountdown();
            }}
          >
            <Text>Start</Text>
          </TouchableOpacity>
        )}
        {countdownActive && (
          <TouchableOpacity
            onPress={() => {
              stopSleepTimer();
            }}
          >
            <Text>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* <TouchableOpacity onPress={closeActionBar}>
        <Text>Close</Text>
      </TouchableOpacity> */}
    </View>
  );
};

export default PlaylistActionBar;
