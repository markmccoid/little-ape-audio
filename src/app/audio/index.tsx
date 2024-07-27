import { StyleSheet, View, SafeAreaView, ActivityIndicator } from "react-native";
import PlaylistContainer from "../../components/playlists/PlaylistContainer";
import { usePlaybackStore } from "../../store/store";
import PlaylistTrackControl from "../../components/playlists/PlaylistTrackControl";
import { MotiView } from "moti";
import usePlaylistColors from "hooks/usePlaylistColors";
import { useEffect, useState } from "react";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";

// const track: Track = {
//   id: "one",
//   url: require("../../assets/funk.mp3"),
//   artist: "Hunter McCoid",
//   artwork: require("../../assets/littleapeaudio.png"),
//   isLiveStream: true,
// };
export default function AudioScreen() {
  const isPlaylistLoaded = usePlaybackStore((state) => state.playlistLoaded);
  const isFocused = useIsFocused();

  // useFocusEffect(() => setFocused((r) => !r));
  // console.log("FOC", focused);
  return (
    <SafeAreaView className={`flex-1 ${isPlaylistLoaded ? "bg-amber-200" : "bg-amber-50"} `}>
      <View className="flex-col flex-1 justify-start flex-grow bg-amber-50">
        <PlaylistContainer />
        {isPlaylistLoaded && isFocused && (
          <MotiView
            className="absolute bottom-0 w-full"
            from={{ opacity: 0, translateY: 200 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: "timing",
              duration: 750,
            }}
            exit={{ opacity: 0, translateY: 200 }}
            exitTransition={{
              type: "timing",
              duration: 2000,
            }}
          >
            <PlaylistTrackControl />
          </MotiView>
        )}
      </View>
    </SafeAreaView>
  );
}
