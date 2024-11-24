import { Dimensions, View, Text, SafeAreaView } from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import TrackPlayerContainer from "@components/trackPlayer/TrackPlayerContainer";
import PlayerHeaderComponent from "@components/trackPlayer/PlayerRouteHeader";
import { usePlaybackStore } from "@store/store";
import { AnimatePresence, MotiText, MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import usePlaylistColors from "hooks/usePlaylistColors";
import { colors } from "@constants/Colors";
import { Skeleton } from "moti/skeleton";
import Wave from "@components/common/animations/Wave";
import ABSBookLoadingIndicator from "@components/dropbox/AudiobookShelf/book/ABSBookLoadingIndicator";

const { width, height } = Dimensions.get("window");
export type PlayerRouteParams = {
  playlistId: string;
};
const PlaylistScreen = () => {
  const { playlistId } = useLocalSearchParams() as PlayerRouteParams;
  const isLoaded = usePlaybackStore((state) => state.playlistLoaded);
  const playlistColors = usePlaylistColors(playlistId);
  // const { setCurrentPlaylist } = usePlaybackStore((state) => state.actions);
  const [shouldRender, setShouldRender] = React.useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setShouldRender(true);
    });
    return () => {
      setShouldRender(false);
    };
  }, [playlistId]);

  //~
  if (!shouldRender || !isLoaded) {
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
      ></LinearGradient>
    );
  }
  return (
    <AnimatePresence>
      {!isLoaded && (
        <MotiView key={1} style={{ flex: 1 }}>
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
            <SafeAreaView className="flex-1 flex-row justify-center">
              <Stack.Screen
                options={{
                  headerShown: false,
                }}
              />
              <View className="mt-[175]">
                <MotiText
                  from={{ opacity: 0.85, scale: 1 }}
                  animate={{ opacity: 1, scale: 1.2 }}
                  className="text-base font-semibold"
                  transition={{
                    loop: true,
                    repeatReverse: true,
                    duration: 500,
                    type: "timing",
                  }}
                >
                  Loading...
                </MotiText>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </MotiView>
      )}
      {isLoaded && (
        <MotiView key={2} className="flex-1 bg-amber-50">
          <Stack.Screen
            options={{
              header: () => <PlayerHeaderComponent playlistId={playlistId} />,
              headerShown: true,
            }}
          />

          <TrackPlayerContainer />
        </MotiView>
      )}
    </AnimatePresence>
  );
  //~

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
          {/* <MotiView
            // animate={{ backgrorundColor: playlistColors?.secondary?.color }}
            transition={{
              type: "timing",
            }}
            className="flex-1 mt-10"
          > */}
          <View className="h-2" />
          {/* <Text className="text-center mt-2 text-base">Loading...</Text> */}
          <Wave />
          {/* </MotiView> */}
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
