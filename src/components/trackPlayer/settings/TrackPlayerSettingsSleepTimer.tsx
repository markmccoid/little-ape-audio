import { View, Text, Dimensions, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import SleepButton from "./SleepButton";
import { AnimatedPressable } from "@components/common/buttons/Pressables";
import { useSettingStore } from "@store/store-settings";
import { update } from "lodash";
import { formatSeconds, timeBetween } from "@utils/formatUtils";
import useSleepTimer from "@components/common/sleepTimer/useSleepTimer";
import TimerCountdown from "@components/common/sleepTimer/TimerCountdown";
import { AnimatePresence, MotiView } from "moti";

const { width, height } = Dimensions.get("window");
const COMPONENT_PADDING = 10;

const TrackPlayerSettingsSleepTimer = () => {
  const { secondsLeft } = useSleepTimer();
  const countdownActive = useSettingStore((state) => state.countdownActive);
  const sleepTime = useSettingStore((state) => state.sleepTimeMinutes);

  const { updateSleepTime, startSleepTimer, stopSleepTimer } = useSettingStore(
    (state) => state.actions
  );

  const handleSetSleepTime = (value: number) => {
    const newTime = sleepTime + value;
    if (newTime < 0) {
      updateSleepTime(0);
      return;
    }
    updateSleepTime(newTime);
  };

  return (
    <View style={{ width: width, paddingHorizontal: COMPONENT_PADDING }}>
      <View className="flex flex-col bg-white border border-amber-950 rounded-lg">
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
                <Text className="text-base font-semibold text-red-900">
                  Stop
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* <View className="w-full h-[1] bg-amber-950 mb-2" /> */}
        <View
          className={`h-[50] border-t border-amber-950 pt-1 rounded-b-md ${
            countdownActive ? "bg-red-200" : "bg-white"
          }`}
        >
          <AnimatePresence exitBeforeEnter>
            {countdownActive && (
              <MotiView
                className="flex-row justify-center mt-[7]"
                key="a"
                from={{ opacity: 0.2, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.2, scale: 0.5 }}
              >
                <TimerCountdown />
              </MotiView>
            )}
            {!countdownActive && (
              <MotiView
                className="flex-row justify-between p-2"
                key="b"
                from={{ opacity: 0.2, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.2, scale: 0.5 }}
              >
                <SleepButton
                  onPress={() => handleSetSleepTime(-5)}
                  buttonTime="-5"
                />
                <SleepButton
                  onPress={() => handleSetSleepTime(-10)}
                  buttonTime="-10"
                />
                <SleepButton
                  onPress={() => handleSetSleepTime(-15)}
                  buttonTime="-15"
                />
                <View className="w-[20]" />
                <SleepButton
                  onPress={() => handleSetSleepTime(5)}
                  buttonTime="+5"
                />
                <SleepButton
                  onPress={() => handleSetSleepTime(10)}
                  buttonTime="+10"
                />
                <SleepButton
                  onPress={() => handleSetSleepTime(15)}
                  buttonTime="+15"
                />
              </MotiView>
            )}
          </AnimatePresence>
        </View>
      </View>
    </View>
  );
};

export default TrackPlayerSettingsSleepTimer;
