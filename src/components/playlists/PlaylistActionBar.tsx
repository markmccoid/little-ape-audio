import { View, Text, TouchableOpacity, TextInput } from "react-native";
import React, { useEffect } from "react";
import { useSettingStore } from "@store/store-settings";
import { AnimatePresence, MotiText, MotiView } from "moti";
import TimerCountdown from "@components/common/sleepTimer/TimerCountdown";
import SleepTimeEntry from "@components/common/sleepTimer/SleepTimeEntry";
import SleepTimeContainer from "@components/common/sleepTimer/SleepTimeContainer";

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
  const handleSleepTimeUpdateNum = (minutesString: string) => {
    const minutes = isNaN(parseInt(minutesString))
      ? 0
      : parseInt(minutesString);
    updateSleepTime(minutes);
  };
  return (
    <View
      className={`flex-row w-full justify-start  items-center px-2 h-[${barHeight}] `}
    >
      <View className="absolute px-2">
        <Text className="text-base font-medium text-amber-950">
          Sleep Timer{" "}
        </Text>
      </View>
      <View className="flex-grow items-center">
        <SleepTimeContainer />
      </View>
      {/* START and STOP Buttons */}
      <View className="absolute right-0 px-2">
        {!countdownActive && sleepTime > 0 && (
          <TouchableOpacity
            className=""
            onPress={() => {
              startSleepTimer();
            }}
          >
            <Text className="text-base font-semibold text-green-900">
              Start
            </Text>
          </TouchableOpacity>
        )}
        {countdownActive && (
          <TouchableOpacity
            onPress={() => {
              stopSleepTimer();
            }}
          >
            <Text className="text-base font-semibold text-red-900">Stop</Text>
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
