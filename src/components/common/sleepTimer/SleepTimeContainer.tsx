import { View, Text } from "react-native";
import React from "react";
import { AnimatePresence } from "moti";
import TimerCountdown from "./TimerCountdown";
import SleepTimeEntry from "./SleepTimeEntry";

const SleepTimeContainer = () => {
  return (
    <View>
      <AnimatePresence>
        <SleepTimeEntry key="a" />
        <TimerCountdown key="b" />
      </AnimatePresence>
    </View>
  );
};

export default SleepTimeContainer;
