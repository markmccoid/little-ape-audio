import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, Dimensions } from "react-native";
import React, { useState } from "react";
import { getCurrentPlaylist, usePlaybackStore } from "../../store/store";
import {
  BackIcon,
  BackInTimeIcon,
  ForwardIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
  SpinnerForwardIcon,
} from "../common/svg/Icons";
import { useTrackPlayerEvents, Event, State } from "react-native-track-player";
import { useSettingStore } from "../../store/store-settings";
import { colors } from "../../constants/Colors";
import usePlaylistColors from "hooks/usePlaylistColors";
import { darkenColor, lightenColor } from "@utils/otherUtils";

const { width, height } = Dimensions.get("window");
// Subscribing to the following events inside MyComponent
const events = [Event.PlaybackState, Event.PlaybackError];

type Props = {
  style?: ViewStyle;
};
const CONTROLSIZE = 25;

const TrackPlayerControlsMinimal = ({ style }: Props) => {
  const jumpSecondsForward = useSettingStore((state) => state.jumpForwardSeconds);
  const jumpSecondsBackward = useSettingStore((state) => state.jumpBackwardSeconds);
  const playbackActions = usePlaybackStore((state) => state.actions);
  // const [playerState, setPlayerState] = useState(null);
  const playerState = usePlaybackStore((state) => state.playerState);
  // const playlist = usePlaybackStore((state) => state.currentPlaylist);
  const playlist = getCurrentPlaylist();
  const actions = usePlaybackStore((state) => state.actions);
  const playlistColors = usePlaylistColors();

  const isPlaying = playerState === State.Playing;

  //~ --- ----
  const play = async () => {
    await playbackActions.play();
  };
  const pause = async () => {
    playbackActions.pause();
  };

  const CONTROLCOLOR =
    playlistColors?.background?.colorType === "dark"
      ? playlistColors.background?.color
      : playlistColors?.secondary?.colorType === "dark"
      ? playlistColors.secondary?.color
      : "black";

  return (
    <View className="flex flex-col justify-center items-center">
      <View className="flex-row gap-10 items-center justify-center" style={style}>
        {/* SEEK BACKWARD */}
        <TouchableOpacity onPress={() => actions.jumpForward(jumpSecondsBackward)}>
          <SpinnerForwardIcon
            size={CONTROLSIZE}
            color={CONTROLCOLOR}
            style={{
              transform: [{ rotateZ: "-45deg" }, { rotateY: "180deg" }, { scale: 1.1 }],
            }}
          />
          <Text
            style={{
              position: "absolute",
              bottom: 4,
              right: 5,
              color: CONTROLCOLOR,
            }}
            className="text-xs"
          >
            {jumpSecondsBackward}
          </Text>
        </TouchableOpacity>
        {/* PLAY/PAUSE */}
        <TouchableOpacity
          onPress={isPlaying ? () => pause() : () => play()}
          style={styles.actionButton}
        >
          <View>
            {!isPlaying ? (
              <PlayIcon size={CONTROLSIZE} color={CONTROLCOLOR} />
            ) : (
              <PauseIcon size={CONTROLSIZE} color={CONTROLCOLOR} />
            )}
          </View>
        </TouchableOpacity>
        {/* SEEK FORWARD */}
        <TouchableOpacity onPress={() => actions.jumpForward(jumpSecondsForward)}>
          <SpinnerForwardIcon
            size={CONTROLSIZE}
            color={CONTROLCOLOR}
            style={{ transform: [{ rotateZ: "45deg" }, { scale: 1.1 }] }}
          />
          <Text
            style={{
              position: "absolute",
              bottom: 4,
              right: 7,
              color: CONTROLCOLOR,
            }}
            className="text-xs"
          >
            {jumpSecondsForward}
          </Text>
        </TouchableOpacity>
      </View>
      <Text
        className="text-sm text-center mt-2"
        style={{ width: width / 1.5, color: CONTROLCOLOR }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {playlist?.name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  actionButton: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    // borderWidth: 1,
    // borderRadius: 5,
  },
});

export default TrackPlayerControlsMinimal;
