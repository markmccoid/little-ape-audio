import { View, Image, StyleSheet, Dimensions, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import TrackPlayerControls from "./TrackPlayerControls";
import TrackPlayerProgressBar from "./TrackPlayerProgressBar";
import TrackPlayerImage from "./TrackPlayerImage";
import BottomSheetContainer from "./bottomSheet/BottomSheetContainer";
import {
  useCurrentPlaylist,
  usePlaybackStore,
  useTrackActions,
  useTracksStore,
} from "@store/store";
import { colors } from "@constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import usePlaylistColors from "hooks/usePlaylistColors";
import TrackPlayerChaptProgressBar from "./TrackPlayerChaptProgressBar";
import { Link, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import Animated, { SharedTransition, withSpring } from "react-native-reanimated";
import { useDropboxStore } from "@store/store-dropbox";
import ABSToggleBookRead from "@components/common/ABSToggleBookRead";
import ABSToggleBookFavorite from "@components/common/ABSToggleBookFavorite";
import ABSLinkToBook from "@components/common/ABSLinkToBook";
import { ShareIcon } from "@components/common/svg/Icons";
import TrackPlayerExtendedJumps from "./TrackPlayerExtendedJumps";
import { useSettingStore } from "@store/store-settings";

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
  const playlistTracks = useTracksStore((state) =>
    state.actions.getPlaylistTracks(params?.playlistId)
  );
  const showExtendedJumps = useSettingStore((state) => state.showExtendedJumps);
  // const audioSource = playlistTracks[0].externalMetadata.audioSource;
  //! Get Info needed to mark as favorite and read for ABS books
  // const playlistId = usePlaybackStore((state) => state.currentPlaylistId);
  // const playList = useTracksStore((state) => state.actions.getPlaylist(playlistId));
  // const track = useTracksStore((state) =>
  //   state.tracks.find((track) => track.id === playList.trackIds[0])
  // );

  // const bookId = track?.sourceLocation.split("~")[0];
  // const audioSource = track.externalMetadata.audioSource;
  // const folderAttributes = useDropboxStore((state) => state.folderAttributes);
  // console.log(
  //   "Folder Attributes",
  //   folderAttributes.filter((el) => el.audioSource === "abs" && el.id === bookId)
  // );
  //!

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
              {showExtendedJumps && <TrackPlayerExtendedJumps />}
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
