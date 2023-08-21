import { View, Text } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import useSleepTimer from "./useSleepTimer";
import { formatSeconds } from "@utils/formatUtils";
import { AnimatePresence, MotiText, MotiView } from "moti";
import { useSettingStore } from "@store/store-settings";

const TimerCountdown = () => {
  const { secondsLeft } = useSleepTimer();
  const countdownActive = useSettingStore((state) => state.countdownActive);
  const [viewWidth, setViewWidth] = useState(undefined);
  const viewRef = useRef<View>();
  const textRef = useRef<Text>();
  // Reset the viewWidth to undefined whenever countdownActive is NOT active
  const hold = useMemo(
    () => !countdownActive && setViewWidth(undefined),
    [countdownActive]
  );

  const handleFormatSeconds = (seconds: number) => {
    // if more than one hour include the hours
    if (secondsLeft > 60 * 60) {
      return formatSeconds(secondsLeft, "minimal", true);
    } else {
      return formatSeconds(secondsLeft, "minimal", false);
    }
  };

  // if (!countdownActive) {
  //   return null;
  // }
  return (
    <View>
      {!countdownActive && null}
      {countdownActive && (
        <MotiView
          key="b"
          ref={viewRef}
          onLayout={(event) => {
            if (!viewWidth && handleFormatSeconds(secondsLeft)) {
              setViewWidth(event.nativeEvent.layout.width + 20);
            }
          }}
          from={{ opacity: 0.2, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.2, scale: 0.5 }}
          className={`bg-amber-200 px-1 border border-amber-400 rounded-md`}
          style={{
            width: viewWidth,
          }}
        >
          <MotiText
            ref={textRef}
            from={{ opacity: 0.2 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 500,
              delay: 1000,
            }}
            className="text-center text-base font-semibold"
          >
            {handleFormatSeconds(secondsLeft) || "??:??"}
          </MotiText>
        </MotiView>
      )}
    </View>
  );
};

export default TimerCountdown;
