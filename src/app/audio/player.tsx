import { Dimensions, View, Text, SafeAreaView } from "react-native";
import React, { useEffect } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import TrackPlayerContainer from "@components/trackPlayer/TrackPlayerContainer";
import PlayerHeaderComponent from "@components/trackPlayer/PlayerRouteHeader";
import { usePlaybackStore } from "@store/store";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import usePlaylistColors from "hooks/usePlaylistColors";
import { colors } from "@constants/Colors";
import { Skeleton } from "moti/skeleton";

const { width, height } = Dimensions.get("window");
export type PlayerRouteParams = {
  playlistId: string;
};
const PlaylistScreen = () => {
  const { playlistId } = useLocalSearchParams() as PlayerRouteParams;
  const isLoaded = usePlaybackStore((state) => state.playlistLoaded);
  const playlistColors = usePlaylistColors(playlistId);
  const { setCurrentPlaylist } = usePlaybackStore((state) => state.actions);

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
        <SafeAreaView className="flex-1 flex-row">
          <Stack.Screen
            options={{
              headerShown: false,
            }}
          />
          <MotiView
            // animate={{ backgrorundColor: playlistColors?.secondary?.color }}
            transition={{
              type: "timing",
            }}
            className="flex-1 mt-10"
          >
            <View className="h-2" />
            <Text className="text-center mt-2 text-base">Loading...</Text>
          </MotiView>
        </SafeAreaView>
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
