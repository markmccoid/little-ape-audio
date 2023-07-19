import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import TrackPlayerSettingsContainer from "../../components/trackPlayer/settings/TrackPlayerSettingsContainer";
import { Stack } from "expo-router";
import { getCurrentPlaylist, usePlaybackStore } from "../../store/store";
import { colors } from "../../constants/Colors";

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
