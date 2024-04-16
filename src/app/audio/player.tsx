import { Dimensions, View, Text } from "react-native";
import React, { useEffect } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import TrackPlayerContainer from "@components/trackPlayer/TrackPlayerContainer";
import PlayerHeaderComponent from "@components/trackPlayer/PlayerRouteHeader";
import { usePlaybackStore } from "@store/store";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import usePlaylistColors from "hooks/usePlaylistColors";
import { colors } from "@constants/Colors";

const { width, height } = Dimensions.get("window");
export type PlayerRouteParams = {
  playlistId: string;
};
const PlaylistScreen = () => {
  const { playlistId } = useLocalSearchParams() as PlayerRouteParams;
  const isLoaded = usePlaybackStore((state) => state.playlistLoaded);
  const playlistColors = usePlaylistColors(playlistId);

  if (!isLoaded) {
    return (
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
        <View className="flex-1">
          <Stack.Screen
            options={{
              headerShown: false,
            }}
          />
          <Text>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }
  return (
    <MotiView className="flex-1 bg-amber-50">
      <Stack.Screen
        options={{
          header: () => <PlayerHeaderComponent playlistId={playlistId} />,
          headerShown: true,
        }}
      />

      <TrackPlayerContainer />
    </MotiView>
  );
};

export default PlaylistScreen;
