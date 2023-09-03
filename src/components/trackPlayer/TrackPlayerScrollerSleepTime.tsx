import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useSettingStore } from "@store/store-settings";
import useSleepTimer from "@components/common/sleepTimer/useSleepTimer";
import SleepTimeContainer from "@components/common/sleepTimer/SleepTimeContainer";

const TrackPlayerScrollerSleepTime = () => {
  const countdownActive = useSettingStore((state) => state.countdownActive);
  const sleepTime = useSettingStore((state) => state.sleepTimeMinutes);

  const { startSleepTimer, stopSleepTimer } = useSettingStore(
    (state) => state.actions
  );

  return (
    <View className="flex-col flex-grow bg-white border border-amber-900 rounded-lg">
      <View className="flex-row justify-center p-2">
        <Text className="font-bold text-lg">Sleep in {sleepTime} min</Text>
        {/* START and STOP Buttons */}
        <View className="absolute right-1 px-2 h-full top-2">
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
      </View>
      <View
        className={`border-t border-t-amber-900 p-2 items-center rounded-lg ${
          countdownActive ? "bg-red-200" : "bg-white"
        }`}
      >
        <SleepTimeContainer />
      </View>
    </View>
  );
};

export default TrackPlayerScrollerSleepTime;
