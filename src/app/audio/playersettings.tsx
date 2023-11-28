import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import TrackPlayerSettingsContainer from "../../components/trackPlayer/settings/TrackPlayerSettingsContainer";
import { Stack } from "expo-router";
import TrackPlayerSettingsHeader from "@components/trackPlayer/settings/TrackPlayerSettingsHeader";

const PlaylistSettings = () => {
  return (
    <SafeAreaView className="bg-amber-50 flex-1 ">
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <TrackPlayerSettingsHeader />,
          // title: `${playlist.name} Settings`,
          // headerStyle: { backgroundColor: gradientTop },
          // headerTintColor: gradientTopText,
        }}
      />
      <TrackPlayerSettingsContainer />
    </SafeAreaView>
  );
};

export default PlaylistSettings;
