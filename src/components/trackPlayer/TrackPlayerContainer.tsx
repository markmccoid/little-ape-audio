import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { Audio } from "expo-av";
import { usePlaybackStore, useTracksStore } from "../../../src/store/store";
import { PlayIcon, PauseIcon } from "../common/svg/Icons";

import TrackSlider from "./TrackSlider";
import TrackPlayerControls from "./TrackPlayerControls";
import TrackPlaybackState from "./TrackPlaybackState";
import { AudioTrack } from "../../store/types";
import TrackPlayerProgressBar from "./TrackPlayerProgressBar";
import TrackList from "./TrackList";

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
  return (
    <View>
      <TrackPlayerControls />
      <TrackPlayerProgressBar />
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
