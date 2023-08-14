import { View, Text, Dimensions, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import SleepButton from "./SleepButton";
import { AnimatedPressable } from "@components/common/buttons/Pressables";
import { useSettingStore } from "@store/store-settings";
import { update } from "lodash";

const { width, height } = Dimensions.get("window");
const COMPONENT_PADDING = 10;

const TrackPlayerSettingsSleepTimer = () => {
  // const [sleepTime, setSleepTime] = useState(0);
  const sleepTime = useSettingStore((state) => state.sleepTimeMinutes);
  const { updateSleepTime } = useSettingStore((state) => state.actions);

  const handleSetSleepTime = (value: number) => {
    const newTime = sleepTime + value;
    if (newTime < 0) {
      // setSleepTime(0);
      updateSleepTime(0);
      return;
    }
    // setSleepTime(newTime);
    updateSleepTime(newTime);
  };

  return (
    <View style={{ width: width, paddingHorizontal: COMPONENT_PADDING }}>
      <View className="flex flex-col bg-white border border-amber-950 rounded-lg">
        <View className="flex-row justify-center p-2">
          <Text className="font-bold text-lg">Sleep in {sleepTime} min</Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Not Functional",
                "The Sleep time is not yet functional"
              )
            }
            className="absolute right-2 self-center"
          >
            <Text className="text-base font-semibold text-amber-800">
              Start
            </Text>
          </TouchableOpacity>
        </View>
        <View className="w-full h-[1] bg-amber-950 mb-2" />
        <View className="flex-row justify-between p-2">
          <SleepButton onPress={() => handleSetSleepTime(-5)} buttonTime="-5" />
          <SleepButton
            onPress={() => handleSetSleepTime(-10)}
            buttonTime="-10"
          />
          <SleepButton
            onPress={() => handleSetSleepTime(-15)}
            buttonTime="-15"
          />
          <View className="w-[35]" />
          <SleepButton onPress={() => handleSetSleepTime(5)} buttonTime="+5" />
          <SleepButton
            onPress={() => handleSetSleepTime(10)}
            buttonTime="+10"
          />
          <SleepButton
            onPress={() => handleSetSleepTime(15)}
            buttonTime="+15"
          />
        </View>
      </View>
    </View>
  );
};

export default TrackPlayerSettingsSleepTimer;
