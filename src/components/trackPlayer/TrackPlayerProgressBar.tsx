import { View, Text, Dimensions } from "react-native";
import React, { useState } from "react";
import Slider from "@react-native-community/slider";
import TrackPlayer, { useProgress } from "react-native-track-player";
import { usePlaybackStore } from "../../store/store";
import { formatSeconds } from "../../utils/formatUtils";

const { width, height } = Dimensions.get("window");
const TrackPlayerProgressBar = () => {
  const { position, duration } = useProgress();
  const [seeking, setSeeking] = useState<number>();
  function handleChange(value) {
    TrackPlayer.seekTo(value);
    setSeeking(undefined);
  }
  return (
    <View>
      <Text>{formatSeconds(Math.floor(position))}</Text>
      {seeking && <Text>{formatSeconds(Math.floor(seeking))}</Text>}
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
