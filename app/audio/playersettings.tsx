import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import TrackPlayerSettingsContainer from "../../src/components/trackPlayer/settings/TrackPlayerSettingsContainer";
import { Stack } from "expo-router";
import { getCurrentPlaylist, usePlaybackStore } from "../../src/store/store";
import { colors } from "../../src/constants/Colors";

const PlaylistSettings = () => {
  // const playlist = usePlaybackStore((state) => state.currentPlaylist);
  const playlist = getCurrentPlaylist();

  return (
    <SafeAreaView className="bg-amber-50 flex-1 ">
      <Stack.Screen
        options={{
          title: `${playlist.name} Settings`,
          headerStyle: { backgroundColor: colors.amber400 },
        }}
      />
      <TrackPlayerSettingsContainer />
    </SafeAreaView>
  );
};

export default PlaylistSettings;
