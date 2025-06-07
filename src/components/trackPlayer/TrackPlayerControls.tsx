import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Dimensions,
  Alert,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { usePlaybackStore, useTracksStore } from "../../store/store";
import { PauseIcon, PlayIcon, RewindIcon } from "../common/svg/Icons";
import TrackPlayer, { State } from "react-native-track-player";
import { useSettingStore } from "../../store/store-settings";
import { SpinnerForwardIcon } from "../common/svg/Icons";
import { formatSeconds } from "../../utils/formatUtils";
import { AnimatePresence, MotiView } from "moti";
import usePlaylistColors from "hooks/usePlaylistColors";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");

type Props = {
  style?: ViewStyle;
};
const CONTROLSIZE = 45;
// Give the play/pause button some more space by setting left/right margins a bit smaller
const CONTROL_L_R_MARGIN = (width - CONTROLSIZE * 3) / 4 / 1.25;

const TrackPlayerControls = ({ style }: Props) => {
  const jumpSecondsForward = useSettingStore((state) => state.jumpForwardSeconds);
  const jumpSecondsBackward = useSettingStore((state) => state.jumpBackwardSeconds);
  const playbackActions = usePlaybackStore((state) => state.actions);

  const playerState = usePlaybackStore((state) => state.playerState);
  const isPlaylistLoaded = usePlaybackStore((state) => state.playlistLoaded);
  //!
  const playlistId = usePlaybackStore((state) => state.currentPlaylistId);
  const x = useTracksStore((state) => state.actions.getPlaylist(playlistId));
  const track = useTracksStore((state) => state.tracks.find((track) => track.id === x.trackIds[0]));
  console.log(Object.keys(track), track.sourceLocation);

  //!
  // set isPlaying boolean based on playerState stored in Playback Store
  const isPlaying = playerState === State.Playing;

  const playlistColors = usePlaylistColors();
  // If colorType is dark, then we know background color is dark enough to use
  // for controls, otherwise use default
  const CONTROLCOLOR =
    playlistColors?.background?.colorType === "dark"
      ? playlistColors.background?.color
      : playlistColors?.secondary?.colorType === "dark"
      ? playlistColors.secondary?.color
      : "black";

  //~ --- ----
  const play = async () => {
    await playbackActions.play();
  };
  const pause = async () => {
    await playbackActions.pause();
  };

  if (!isPlaylistLoaded) {
    return null;
  }

  return (
    <View className="flex-row w-full justify-between items-center ">
      <View className="flex-row flex-1 items-center justify-center flex-grow">
        {/* SEEK BACK */}
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            playbackActions.jumpBack(jumpSecondsBackward);
          }}
          className={`relative justify-center items-center`}
          style={{ marginLeft: CONTROL_L_R_MARGIN }}
        >
          <SpinnerForwardIcon
            size={CONTROLSIZE}
            color={CONTROLCOLOR}
            style={{
              transform: [{ rotateZ: "-0deg" }, { rotateY: "180deg" }, { scale: 1.1 }],
            }}
          />
          {/* <Text style={{ position: "absolute", bottom: -10, left: 12 }}> */}
          <Text
            style={{
              position: "absolute",
              paddingTop: 2,
              color: CONTROLCOLOR,
            }}
          >
            {jumpSecondsBackward}
          </Text>
        </TouchableOpacity>
        {/* PLAY/PAUSE */}
        <Pressable
          onPress={isPlaying ? async () => await pause() : async () => await play()}
          style={styles.actionButton}
          className="mx-3 flex-grow items-center"
        >
          <View
            className="relative flex-grow"
            style={{
              width: CONTROLSIZE * 2,
              height: CONTROLSIZE * 2,
            }}
          >
            <AnimatePresence>
              {!isPlaying ? (
                <MotiView
                  key={1}
                  className="absolute"
                  from={{
                    opacity: 0,
                    transform: [{ rotateZ: "-50deg" }, { scale: 0.7 }],
                  }}
                  animate={{
                    opacity: 1,
                    transform: [{ rotateZ: "0deg" }, { scale: 1 }],
                  }}
                  exit={{ opacity: 0, transform: [{ rotateZ: "-50deg" }, { scale: 0.7 }] }}
                  exitTransition={{ type: "timing", duration: 500 }}
                  transition={{ type: "timing", duration: 300 }}
                >
                  <PlayIcon size={CONTROLSIZE * 2} color={CONTROLCOLOR} />
                </MotiView>
              ) : (
                <MotiView
                  key={3}
                  className="absolute"
                  from={{
                    opacity: 0,
                    transform: [
                      { rotateZ: "50deg" },
                      { scale: 0.7 },
                      // { rotateZ: isPlaying ? "50deg" : "0deg" },
                      // { scale: isPlaying ? 0.7 : 1 },
                    ],
                  }}
                  animate={{
                    opacity: 1,
                    transform: [{ rotateZ: "0deg" }, { scale: 1 }],
                  }}
                  exit={{ opacity: 0, transform: [{ rotateZ: "70deg" }, { scale: 0.5 }] }}
                  exitTransition={{ type: "timing", duration: 400 }}
                  transition={{ type: "timing", duration: 500 }}
                >
                  <PauseIcon size={CONTROLSIZE * 2} color={CONTROLCOLOR} />
                </MotiView>
              )}
            </AnimatePresence>
          </View>
        </Pressable>
        {/* SEEK FORWARD */}
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            playbackActions.jumpForward(jumpSecondsForward);
          }}
          className="relative flex justify-center items-center"
          style={{ marginRight: CONTROL_L_R_MARGIN }}
        >
          <SpinnerForwardIcon
            size={CONTROLSIZE}
            color={CONTROLCOLOR}
            style={{ transform: [{ scale: 1.1 }] }}
          />
          {/* <Text style={{ position: "absolute", bottom: -10, right: 12 }}> */}
          <Text
            style={{
              position: "absolute",
              paddingTop: 2,
              // bottom: 8,
              // right: 11,
              color: CONTROLCOLOR,
            }}
          >
            {jumpSecondsForward}
          </Text>
        </TouchableOpacity>
      </View>
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

export default TrackPlayerControls;
