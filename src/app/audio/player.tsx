import { Dimensions, View, Image, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { getCurrentPlaylist, usePlaybackStore } from "../../store/store";
import TrackPlayerContainer from "@components/trackPlayer/TrackPlayerContainer";

const littleApeImage05 = require("../../../assets/images/LittleApAudio05.png");

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
          headerBackTitle: "Back",
          headerTitle: () => (
            <View className="flex">
              <Text
                className="text-base font-bold text-amber-950 flex-1 text-center"
                style={{ width: width / 1.45 }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {playlist?.name}
              </Text>
            </View>
          ),
        }}
      />

      <TrackPlayerContainer />
    </View>
  );
};

export default PlaylistScreen;