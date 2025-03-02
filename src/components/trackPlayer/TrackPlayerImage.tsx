import { View, Dimensions, TouchableOpacity, Image } from "react-native";
import React from "react";
import { BackIcon, NextIcon } from "../common/svg/Icons";
import { useCurrentPlaylist, usePlaybackStore } from "../../store/store";
import TrackPlayerScroller from "./TrackPlayerScroller";
import { getColorLuminance } from "@utils/otherUtils";
import usePlaylistColors from "hooks/usePlaylistColors";

const { width, height } = Dimensions.get("window");

const TrackPlayerImage = () => {
  const actions = usePlaybackStore((state) => state.actions);
  const queue = usePlaybackStore((state) => state.trackPlayerQueue);
  const currTrackIndex = usePlaybackStore((state) => state.currentTrackIndex);
  const playlistColors = usePlaylistColors();
  const currentChapterIndex = usePlaybackStore((state) => state.currentChapterIndex);

  // const playlist = actions.getCurrentPlaylist();
  // console.log("IMAGE Chpt Info", currChapterInfo);
  /**
   * if qLength === 1 && currentChapterIndex === -1 don't show or disable BOTH
   * if qLenght !== 1 && currTrackIndex === 0 && currentChapterIndex <= 0 disable PREV
   */
  const displayPrev = !(
    (queue?.length === 1 && currentChapterIndex === -1) ||
    (queue?.length !== 1 && currTrackIndex === 0 && currentChapterIndex <= 0)
  );
  // Display next button if the queue is greater than > 1 OR if the first track has chapters.
  // We only need to check the first track because we loop when going next.
  const displayNext = queue?.length !== 1 || currentChapterIndex !== -1;

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
        <BackIcon size={35} color={playlistColors?.background?.tintColor} />
      </TouchableOpacity>
      {/* Scroller - History, Image, Settings, Description */}
      <TrackPlayerScroller />

      <TouchableOpacity
        onPress={() => actions.next()}
        disabled={!displayNext}
        className={`${displayNext ? "opacity-100" : "opacity-10"}`}
      >
        <NextIcon size={35} color={playlistColors?.background?.tintColor} />
      </TouchableOpacity>
    </View>
  );
};

export default TrackPlayerImage;
