import { View, Text } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import useSleepTimer from "./useSleepTimer";
import { formatSeconds } from "@utils/formatUtils";
import { MotiText, MotiView } from "moti";

const TimerCountdown = () => {
  const { countdownActive, secondsLeft } = useSleepTimer();
  const [viewWidth, setViewWidth] = useState(undefined);
  const viewRef = useRef<View>();
  const textRef = useRef<Text>();
  // Reset the viewWidth to undefined whenever countdownActive is NOT active
  const hold = useMemo(
    () => !countdownActive && setViewWidth(undefined),
    [countdownActive]
  );
  console.log("SecondsLeft", secondsLeft, countdownActive, viewWidth);
  let formattedSeconds = undefined;
  // if more than one hour include the hours
  if (secondsLeft > 60 * 60) {
    formattedSeconds = formatSeconds(secondsLeft, "minimal", true);
  } else {
    formattedSeconds = formatSeconds(secondsLeft, "minimal", false);
  }

  if (!countdownActive) {
    return null;
  }
  return (
    <View
      ref={viewRef}
      onLayout={(event) => {
        if (!viewWidth && formattedSeconds) {
          console.log("onLayout", event.nativeEvent.layout.width);
          setViewWidth(event.nativeEvent.layout.width);
        }
      }}
      // from={{ opacity: 0.2 }}
      // animate={{ opacity: 1 }}
      // transition={{
      //   type: "timing",
      //   duration: 500,
      // }}
      className={`bg-amber-400 p-1 border border-amber-600 `}
      style={{
        width: viewWidth,
      }}
    >
      <Text
        ref={textRef}
        // from={{ opacity: 0.2 }}
        // animate={{ opacity: 1 }}
        // transition={{
        //   type: "timing",
        //   duration: 500,
        //   delay: 1000,
        // }}
      >
        {formattedSeconds}
      </Text>
    </View>
  );
};

const OutputView = (props) => {
  const [viewWidth, setViewWidth] = useState(undefined);
  const viewRef = useRef<View>();
  const { countdownActive, secondsLeft } = useSleepTimer();

  return (
    <View
      ref={viewRef}
      onLayout={(event) => {
        console.log("AHHH", !viewWidth && secondsLeft);
        if (!viewWidth && secondsLeft) {
          console.log("onLayout", event.nativeEvent.layout.width);
          setViewWidth(event.nativeEvent.layout.width);
          props.setViewWidth(event.nativeEvent.layout.width);
        }
      }}
      // from={{ opacity: 0.2 }}
      // animate={{ opacity: 1 }}
      // transition={{
      //   type: "timing",
      //   duration: 500,
      // }}
      // className="bg-amber-400   p-1 border border-amber-600"
      // style={{
      //   width: viewWidth,
      // }}
    >
      <Text
      // from={{ opacity: 0.2 }}
      // animate={{ opacity: 1 }}
      // transition={{
      //   type: "timing",
      //   duration: 500,
      //   delay: 1000,
      // }}
      >
        {props.formattedSeconds}
      </Text>
    </View>
  );
};
export default TimerCountdown;
