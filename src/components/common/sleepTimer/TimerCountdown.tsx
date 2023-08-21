import { View, Text } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import useSleepTimer from "./useSleepTimer";
import { formatSeconds } from "@utils/formatUtils";
import { AnimatePresence, MotiText, MotiView } from "moti";
import { useSettingStore } from "@store/store-settings";

const TimerCountdown = () => {
  const { secondsLeft, formattedOutput } = useSleepTimer();

  const countdownActive = useSettingStore((state) => state.countdownActive);
  const [viewWidth, setViewWidth] = useState(undefined);
  const viewRef = useRef<View>();
  const textRef = useRef<Text>();
  // Reset the viewWidth to undefined whenever countdownActive is NOT active
  const hold = useMemo(
    () => !countdownActive && setViewWidth(undefined),
    [countdownActive]
  );

  return (
    <View>
      {!countdownActive && null}
      {countdownActive && (
        <MotiView
          key="b"
          ref={viewRef}
          onLayout={(event) => {
            if (!viewWidth && formattedOutput) {
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
            {formattedOutput || "??:??"}
          </MotiText>
        </MotiView>
      )}
    </View>
  );
};

export default TimerCountdown;
