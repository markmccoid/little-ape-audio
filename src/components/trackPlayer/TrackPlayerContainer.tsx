import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { Audio } from "expo-av";
import {
  AudioTrack,
  usePlaybackStore,
  useTracksStore,
} from "../../../src/store/store";
import { PlayIcon, PauseIcon } from "../common/svg/Icons";

import TrackSlider from "./TrackSlider";
import TrackPlayerControls from "./TrackPlayerControls";
import TrackPlaybackState from "./TrackPlaybackState";

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

const TrackPlayerContainer = () => {
  const playbackActions = usePlaybackStore((state) => state.actions);
  const track = usePlaybackStore((state) => state.currentTrack);
  const playlist = usePlaybackStore((state) => state.currentPlaylist);
  const isPlaying = usePlaybackStore((state) => state.playbackState.isPlaying);
  const isLoaded = usePlaybackStore((state) => state.playbackState.isLoaded);

  return (
    <View style={styles.container} className="border border-black">
      <View className="border border-red-900 flex-grow w-full">
        <Text>{track?.metadata?.title}</Text>
        <View className="flex-grow  border border-yellow-900">
          <Image
            className="rounded-xl"
            style={{
              width: width / 1.25,
              height: width / 1.25,
              resizeMode: "stretch",
              alignSelf: "center",
            }}
            source={{ uri: playlist?.imageURI }}
          />
        </View>
        <TrackPlaybackState />
        <View>
          <TrackPlayerControls />
        </View>
      </View>
      <View className="">
        <TrackSlider />
      </View>
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
