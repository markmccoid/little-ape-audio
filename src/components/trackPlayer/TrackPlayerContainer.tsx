import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import React, { useState } from "react";

import { Audio } from "expo-av";
import { usePlaybackStore, useTracksStore } from "../../../src/store/store";
import { PlayIcon, PauseIcon } from "../common/svg/Icons";

import TrackSlider from "./TrackSlider";
import TrackPlayerControls from "./TrackPlayerControls";
import TrackPlaybackState from "./TrackPlaybackState";
import { AudioTrack } from "../../store/types";
import TrackPlayerProgressBar from "./TrackPlayerProgressBar";
import TrackList from "./TrackList";
import PlaylistImage from "../common/PlaylistImage";
import { formatSeconds } from "../../utils/formatUtils";
import { AnimatePresence, MotiView } from "moti";

type Props = {
  track: AudioTrack;
};
type PlaybackState = {
  isLoaded: boolean;
  playbackObj?: Audio.Sound;
  positionSeconds?: number;
  durationSeconds?: number;
  isPlaying?: boolean;
  isLooping?: boolean;
  isMuted?: boolean;
  rate?: number;
  shouldCorrectPitch?: boolean;
  volume?: number;
};
const { width, height } = Dimensions.get("window");

const leftOffset = (width - width / 2.25) / 2;
const topOffset = width / 1.25 - 50;
const TrackPlayerContainer = () => {
  const [isSeeking, setIsSeeking] = useState(undefined);
  return (
    <View className="flex-1 flex-col">
      <View>
        <AnimatePresence>
          {isSeeking && (
            <MotiView
              className="bg-amber-200 rounded-xl p-2 absolute z-10 opacity-80 border
              border-amber-700"
              style={{
                width: width / 2.25,
                left: leftOffset,
                top: topOffset,
              }}
              from={{
                opacity: 0,
                scale: 0,
              }}
              animate={{
                opacity: 0.9,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0,
              }}
              exitTransition={{
                type: "timing",
                duration: 500,
              }}
            >
              {/* <View
                className="bg-amber-200 rounded-xl p-2 absolute z-10 opacity-80 border-2
              border-amber-700"
                style={{ width: width / 1.5, left: leftOffset, top: topOffset }}
              > */}
              <Text
                className="text-lg font-bold"
                style={{ opacity: 1, zIndex: 11, textAlign: "center" }}
              >
                {formatSeconds(isSeeking)}
              </Text>
              {/* </View> */}
            </MotiView>
          )}
        </AnimatePresence>
        <PlaylistImage
          style={{
            width: width / 1.25,
            height: width / 1.25,
            resizeMode: "stretch",
            alignSelf: "center",
          }}
        />
      </View>
      <TrackPlayerControls />
      <TrackPlayerProgressBar setIsSeeking={setIsSeeking} />
      <TrackList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  actionButton: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 5,
  },
});
export default TrackPlayerContainer;
