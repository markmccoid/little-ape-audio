import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { Audio } from "expo-av";
import TrackPlayerControls from "./TrackPlayerControls";
import { AudioTrack } from "../../store/types";
import TrackPlayerProgressBar from "./TrackPlayerProgressBar";
import TrackList from "./TrackList";
import PlaylistImage from "../common/PlaylistImage";
import TrackPlayerImage from "./TrackPlayerImage";

const { width, height } = Dimensions.get("window");

const TrackPlayerContainer = () => {
  return (
    <View className="flex-1 flex-col">
      <TrackPlayerImage />
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
