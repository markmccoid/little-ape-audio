import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
// import DropboxAuth from "@components/dropbox/DropboxAuth";
import { Link, useRouter } from "expo-router";

import { usePlaybackStore } from "../../store/store";
import TrackPlayerControls from "../trackPlayer/TrackPlayerControls";
import { OpenInNewIcon } from "../common/svg/Icons";

export default function AudioScreen() {
  const currPlaylistId = usePlaybackStore((state) => state.currentPlaylistId);
  const isPlaylistLoaded = usePlaybackStore((state) => state.playlistLoaded);
  const actions = usePlaybackStore((state) => state.actions);
  const route = useRouter();

  const onPlaylistSelect = async () => {
    await actions.setCurrentPlaylist(currPlaylistId);
    route.push({ pathname: "/audio/player", params: {} });
  };
  return (
    <View className=" bg-amber-200 border-t border-amber-900">
      <TrackPlayerControls />
      <TouchableOpacity onPress={onPlaylistSelect} className="absolute right-2">
        <OpenInNewIcon size={30} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    // padding: 24,
  },
  main: {
    flex: 1,
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
});
