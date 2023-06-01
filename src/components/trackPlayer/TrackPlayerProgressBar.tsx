import { View, Text, Dimensions } from "react-native";
import React, { useState } from "react";
import Slider from "@react-native-community/slider";
import TrackPlayer, { useProgress } from "react-native-track-player";
import { usePlaybackStore } from "../../store/store";
import { formatSeconds } from "../../utils/formatUtils";

const { width, height } = Dimensions.get("window");
const TrackPlayerProgressBar = () => {
  const playbackActions = usePlaybackStore((state) => state.actions);
  const { position, duration } = useProgress();
  const [seeking, setSeeking] = useState<number>();
  async function handleChange(value) {
    if (value < 0) value = 0;
    await playbackActions.seekTo(value);
    // await TrackPlayer.seekTo(value);
    setSeeking(undefined);
  }
  // console.log("position", position);
  return (
    <View>
      <Text>
        {formatSeconds(Math.floor(position))} of{" "}
        {formatSeconds(Math.floor(duration))}
      </Text>
      {seeking > 0 && <Text>{formatSeconds(Math.floor(seeking))}</Text>}
      <Slider
        style={{ width: width - 20, height: 40 }}
        minimumValue={0}
        maximumValue={duration}
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#000000"
        value={position}
        onValueChange={setSeeking}
        onSlidingComplete={handleChange}
        // onSlidingStart={() => soundActions.pause()}
        // onSlidingComplete={(val) => soundActions.updatePosition(val)}
      />
    </View>
  );
};

export default TrackPlayerProgressBar;
