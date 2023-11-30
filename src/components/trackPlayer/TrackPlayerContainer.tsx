import { View, Text, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import TrackPlayerControls from "./TrackPlayerControls";
import TrackPlayerProgressBar from "./TrackPlayerProgressBar";
import TrackPlayerImage from "./TrackPlayerImage";
import BottomSheetContainer from "./bottomSheet/BottomSheetContainer";
import { useCurrentPlaylist } from "@store/store";
import { colors } from "@constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { PlaylistImageColors } from "@store/types";
import usePlaylistColors from "hooks/usePlaylistColors";
import TrackPlayerChaptProgressBar from "./TrackPlayerChaptProgressBar";
import TrackPlayerBottomSheet from "./bottomSheet/TrackPlayerBottomSheet";

const { width, height } = Dimensions.get("window");

const TrackPlayerContainer = () => {
  const playlistColors = usePlaylistColors();

  return (
    <View className="flex-1 flex-col ">
      <LinearGradient
        // colors={[`${colorP.secondary}55`, `${colorP.background}55`]}
        colors={[
          `${playlistColors?.secondary?.color}`,
          `${playlistColors?.background?.color}`,
          colors.amber50,
        ]}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.95 }}
        locations={[0.3, 0.6, 1]}
      >
        <View className="">
          <TrackPlayerImage />

          <TrackPlayerProgressBar />
          <TrackPlayerChaptProgressBar />
        </View>
      </LinearGradient>
      <View className=" justify-end mb-[30] mt-[25]">
        <TrackPlayerControls />
      </View>
      <BottomSheetContainer />
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
