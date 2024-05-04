import { View, Text } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Link, Redirect, useRootNavigationState, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuickActionCallback } from "expo-quick-actions/hooks";
import { usePlaybackStore } from "@store/store";

const RootIndex = () => {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => router.replace("/audio"), 1);
  }, []);

  useQuickActionCallback(async (action) => {
    // ! NOTE: when in dev mode and you reload without quitting app, TrackPlayer STAYS SETUP, but isTPSetup gets set to false.
    // console.log("ACTION", action);
    // while (!isTPSetup) {
    //   await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for 100ms
    // }
    const playlistId = action.params.playlistId as string;

    await usePlaybackStore.getState().actions.setCurrentPlaylist(playlistId);
    await usePlaybackStore.getState().actions.play();
    //! Setting the playlist search param AFTER setting the current playlist.
    //! This is useful when in the track player and a Quick Action is used.
    router.setParams({ playlistId });
  });
  return (
    <SafeAreaView>
      <Link href="/audio">
        <Text></Text>
      </Link>
    </SafeAreaView>
  );
};

export default RootIndex;
