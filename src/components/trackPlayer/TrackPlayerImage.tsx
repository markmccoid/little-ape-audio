import { View, Dimensions, TouchableOpacity, Image } from "react-native";
import React from "react";
import PlaylistImage from "../common/PlaylistImage";
import { BackIcon, NextIcon } from "../common/svg/Icons";
import { colors } from "../../constants/Colors";
import { useCurrentPlaylist, usePlaybackStore } from "../../store/store";
import Animated from "react-native-reanimated";
import TrackPlayerScoller from "./TrackPlayerScoller";

const { width, height } = Dimensions.get("window");

const TrackPlayerImage = () => {
  const actions = usePlaybackStore((state) => state.actions);
  const queue = usePlaybackStore((state) => state.trackPlayerQueue);
  const currTrackIndex = usePlaybackStore((state) => state.currentTrackIndex);
  const playlist = useCurrentPlaylist();
  // const playlist = actions.getCurrentPlaylist();

  /**
   * if qLength === 1 don't show or disable BOTH
   * if qLenght !== 1 && currTrackIndex === 0 disable PREV
   */
  const displayPrev = !(
    queue.length === 1 ||
    (queue.length !== 1 && currTrackIndex === 0)
  );
  const displayNext = queue.length !== 1;

  return (
    <View
      className="flex-row justify-between items-center "
      style={{
        marginHorizontal: 5,
      }}
    >
      <TouchableOpacity
        onPress={() => actions.prev()}
        disabled={!displayPrev}
        className={`${displayPrev ? "opacity-100" : "opacity-10"}`}
      >
        <BackIcon size={35} color={colors.amber800} />
      </TouchableOpacity>
      {/* <Image
        source={{ uri: playlist?.imageURI }}
        style={{
          width: width / 1.35,
          height: width / 1.35,
          resizeMode: "stretch",
          alignSelf: "center",
        }}
      /> */}

      <TrackPlayerScoller />

      <TouchableOpacity
        onPress={() => actions.next()}
        disabled={!displayNext}
        className={`${displayNext ? "opacity-100" : "opacity-10"}`}
      >
        <NextIcon size={35} color={colors.amber800} />
      </TouchableOpacity>
    </View>
  );
};

export default TrackPlayerImage;
