import { Dimensions, View, Image, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { getCurrentPlaylist, usePlaybackStore } from "../../src/store/store";
import TrackPlayerContainer from "../../src/components/trackPlayer/TrackPlayerContainer";
const littleApeImage05 = require("../../assets/images/LittleApAudio05.png");

const { width, height } = Dimensions.get("window");

const PlaylistScreen = () => {
  const playlist = getCurrentPlaylist();
  // const playlist = usePlaybackStore(
  //   (state) => state.actions.getCurrentPlaylist
  // )();
  const imageSource =
    playlist?.imageType === "uri"
      ? { uri: playlist.imageURI }
      : playlist.imageURI;
  return (
    <View className="flex-1 bg-amber-50 pt-2">
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text
              className="text-base font-bold text-amber-950 text-center"
              style={{ width: width / 1.35 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {playlist?.name}
            </Text>
          ),
        }}
      />

      <TrackPlayerContainer />
    </View>
  );
};

export default PlaylistScreen;
