import { View, Text, Dimensions } from "react-native";
import React from "react";
import Slider from "@react-native-community/slider";
import { usePlaybackStore } from "../../store/store";
const { width, height } = Dimensions.get("window");
import { formatSeconds } from "../../utils/formatUtils";

const TrackSlider = () => {
  const soundActions = usePlaybackStore((state) => state.actions);
  const { isPlaying, isLoaded, durationSeconds } = usePlaybackStore(
    (state) => state.playbackState
  );
  const positionSeconds = usePlaybackStore((state) => state.currentPosition);

  return (
    <View className="flex-col items-center">
      <Slider
        style={{ width: width - 20, height: 40 }}
        minimumValue={0}
        maximumValue={durationSeconds}
        minimumTrackTintColor="#FFFFFF"
        maximumTrackTintColor="#000000"
        value={positionSeconds}
        onValueChange={(val) =>
          soundActions.updatePosition(Math.floor(val), true)
        }
        onSlidingStart={() => soundActions.pause()}
        onSlidingComplete={(val) => soundActions.updatePosition(val)}
      />
      <Text>{formatSeconds(positionSeconds || 0, "minimal")}</Text>
    </View>
  );
};

export default TrackSlider;
