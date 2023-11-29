import { StyleSheet, View, SafeAreaView } from "react-native";
import PlaylistContainer from "../../components/playlists/PlaylistContainer";
import { usePlaybackStore } from "../../store/store";
import PlaylistTrackControl from "../../components/playlists/PlaylistTrackControl";
import { MotiView } from "moti";
import usePlaylistColors from "hooks/usePlaylistColors";

// const track: Track = {
//   id: "one",
//   url: require("../../assets/funk.mp3"),
//   artist: "Hunter McCoid",
//   artwork: require("../../assets/littleapeaudio.png"),
//   isLiveStream: true,
// };
export default function AudioScreen() {
  const isPlaylistLoaded = usePlaybackStore((state) => state.playlistLoaded);

  return (
    <SafeAreaView className={`flex-1 ${isPlaylistLoaded ? "bg-amber-200" : "bg-amber-50"} `}>
      <View className="flex-col flex-1 justify-start flex-grow bg-amber-50">
        <PlaylistContainer />
        {isPlaylistLoaded && (
          <MotiView
            from={{ opacity: 0, translateY: 200 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: "timing",
              duration: 1000,
              delay: 0,
            }}
          >
            <PlaylistTrackControl />
          </MotiView>
        )}
      </View>
    </SafeAreaView>
  );
}
