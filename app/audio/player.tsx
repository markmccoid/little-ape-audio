import { Dimensions, View, Image } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { usePlaybackStore } from "../../src/store/store";
import TrackPlayerContainer from "../../src/components/trackPlayer/TrackPlayerContainer";

const { width, height } = Dimensions.get("window");
const PlaylistScreen = () => {
  const playlist = usePlaybackStore((state) => state.currentPlaylist);

  return (
    <View>
      <Stack.Screen options={{ title: playlist.author }} />
      <Image
        className="rounded-xl"
        style={{
          width: width / 1.25,
          height: width / 1.25,
          resizeMode: "stretch",
          alignSelf: "center",
        }}
        source={{ uri: playlist?.imageURI }}
      />
      {/* <TrackPlaybackState />
      <Link href="./playersettings">Playlist Settings</Link> */}
      <TrackPlayerContainer />
    </View>
  );
};

export default PlaylistScreen;
