import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useSettingStore } from "@store/store-settings";
import SleepButton from "@components/trackPlayer/settings/SleepButton";
import { MotiView } from "moti";

const SleepTimeEntry = () => {
  const sleepTime = useSettingStore((state) => state.sleepTimeMinutes);
  const [viewWidth, setViewWidth] = useState(0);

  const countdownActive = useSettingStore((state) => state.countdownActive);
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
    <View>
      {/* {countdownActive && null} */}
      {!countdownActive && (
        <MotiView
          key="a"
          from={{ opacity: 0.2, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.2, scale: 0.5 }}
          className="flex-row items-center"
          onLayout={(event) => {
            if (!viewWidth) {
              setViewWidth(event.nativeEvent.layout.width);
            }
          }}
        >
          <SleepButton buttonTime="-5" onPress={() => handleSetSleepTime(-5)} />
          <View className="px-2 w-[50]">
            <Text allowFontScaling={false} className="text-base text-center">
              {sleepTime}
            </Text>
          </View>
          <SleepButton buttonTime="+10" onPress={() => handleSetSleepTime(10)} />
        </MotiView>
      )}
    </View>
  );
};

export default SleepTimeEntry;

{
  /* <TextInput
keyboardType="number-pad"
onChangeText={handleSleepTimeUpdate}
className="text-base h-[30] bg-white border p-1 pb-[15] text-center"
// className="p-1 text-center"
value={sleepTime.toString()}
editable={!Boolean(sleepStartDateTime)}
/> */
}
