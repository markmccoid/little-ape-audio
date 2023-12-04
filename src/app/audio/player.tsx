import { Dimensions, View, Text } from "react-native";
import React, { useEffect } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import TrackPlayerContainer from "@components/trackPlayer/TrackPlayerContainer";
import PlayerHeaderComponent from "@components/trackPlayer/PlayerRouteHeader";

const { width, height } = Dimensions.get("window");
export type PlayerRouteParams = {
  playlistId: string;
};
const PlaylistScreen = () => {
  const { playlistId } = useLocalSearchParams() as PlayerRouteParams;

  return (
    <View className="flex-1 bg-amber-50">
      <Stack.Screen
        options={{
          header: () => <PlayerHeaderComponent playlistId={playlistId} />,
        }}
      />

      <TrackPlayerContainer />
    </View>
  );
};

export default PlaylistScreen;
