import { View, Image, StyleSheet, Dimensions, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import TrackPlayerControls from "./TrackPlayerControls";
import TrackPlayerProgressBar from "./TrackPlayerProgressBar";
import TrackPlayerImage from "./TrackPlayerImage";
import BottomSheetContainer from "./bottomSheet/BottomSheetContainer";
import { useCurrentPlaylist, usePlaybackStore, useTrackActions } from "@store/store";
import { colors } from "@constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { PlaylistImageColors } from "@store/types";
import usePlaylistColors from "hooks/usePlaylistColors";
import TrackPlayerChaptProgressBar from "./TrackPlayerChaptProgressBar";
import TrackPlayerBottomSheet from "./bottomSheet/TrackPlayerBottomSheet";
import { useGlobalSearchParams, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import Animated, { SharedTransition, withSpring } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const transition = SharedTransition.custom((values) => {
  "worklet";
  return {
    height: withSpring(values.targetHeight),
    width: withSpring(values.targetWidth),
  };
});

const TrackPlayerContainer = () => {
  const params = useLocalSearchParams<{ playlistId: string }>();
  const playlistColors = usePlaylistColors(params?.playlistId);
  const isLoaded = usePlaybackStore((state) => state.playlistLoaded);

  // const playlist = useTrackActions().getPlaylist(params?.playlistId);
  return (
    <MotiView className="flex-1 flex-col" from={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <LinearGradient
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
        {isLoaded ? (
          <View className="flex-1 flex-col">
            <TrackPlayerImage />
            <MotiView
              key={1}
              from={{ opacity: 0.2, scale: 0.5, translateY: 50 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 400 }}
            >
              <TrackPlayerProgressBar />
              <TrackPlayerChaptProgressBar />

              <View className="border h-[50] mt-5">
                <Text>HERE</Text>
              </View>
            </MotiView>
          </View>
        ) : null}
      </LinearGradient>

      <View className=" justify-end mb-[30] mt-[25]">
        {isLoaded ? (
          <MotiView
            from={{ opacity: 0.2, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 400 }}
          >
            <TrackPlayerControls />
          </MotiView>
        ) : null}
      </View>
      {isLoaded ? <BottomSheetContainer /> : null}
    </MotiView>
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
