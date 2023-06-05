import { View, Text, Dimensions } from "react-native";
import React, { useState } from "react";
import Slider from "@react-native-community/slider";
import TrackPlayer, { useProgress } from "react-native-track-player";
import { usePlaybackStore } from "../../store/store";
import { formatSeconds } from "../../utils/formatUtils";
import { colors } from "../../constants/Colors";
import { AnimatePresence, MotiView } from "moti";
import AnimateText from "../common/animations/AnimateText";

const { width, height } = Dimensions.get("window");
const TrackPlayerProgressBar = () => {
  const playbackActions = usePlaybackStore((state) => state.actions);
  const { position, duration } = useProgress();
  const queuePos = usePlaybackStore((state) => state.currentQueuePosition);
  const queueDuration = usePlaybackStore(
    (state) => state.currentPlaylist.totalDurationSeconds
  );
  const [seeking, setSeeking] = useState<number>();
  async function handleChange(value) {
    if (value < 0) value = 0;
    await playbackActions.seekTo(value);
    // await TrackPlayer.seekTo(value);
    setSeeking(undefined);
  }

  return (
    <View className="flex-col justify-center items-center mt-3 mb-4">
      <AnimatePresence>
        {seeking > 0 && (
          <AnimateText>{formatSeconds(Math.floor(seeking))}</AnimateText>
        )}
      </AnimatePresence>
      {/* <AnimatePresence>
        {seeking > 0 && (
          <AnimateText>
            {formatSeconds(Math.floor(seeking + queuePos))}
          </AnimateText>
        )}
      </AnimatePresence> */}
      <Slider
        style={{ width: width - 20 }}
        minimumValue={0}
        maximumValue={duration}
        minimumTrackTintColor={colors.amber700}
        maximumTrackTintColor={colors.amber400}
        thumbTintColor={colors.amber600}
        value={position}
        onValueChange={setSeeking}
        onSlidingComplete={handleChange}
        // onSlidingStart={() => soundActions.pause()}
        // onSlidingComplete={(val) => soundActions.updatePosition(val)}
      />
      <View className="flex-row w-full px-1 justify-between mt-[-5]">
        <Text className="font-semibold text-xs">
          {formatSeconds(Math.floor(position))}
        </Text>
        <Text className="font-semibold text-xs">
          {formatSeconds(Math.floor(position + queuePos))} of{" "}
          {formatSeconds(Math.floor(queueDuration))}
        </Text>
        <Text className="font-semibold">
          {formatSeconds(Math.floor(duration))}
        </Text>
      </View>
    </View>
  );
};

export default TrackPlayerProgressBar;
