import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
// import DropboxAuth from "@components/dropbox/DropboxAuth";
import { Link, useRouter } from "expo-router";
import PlaylistImage from "../common/PlaylistImage";

import { usePlaybackStore } from "../../store/store";
import TrackPlayerControlsMinimal from "../trackPlayer/TrackPlayerControlsMinimal";
import { OpenInNewIcon } from "../common/svg/Icons";
import { MotiView } from "moti";

export default function PlaylistTrackControl() {
  const currPlaylistId = usePlaybackStore((state) => state.currentPlaylistId);
  const actions = usePlaybackStore((state) => state.actions);
  const route = useRouter();

  const onPlaylistSelect = async () => {
    await actions.setCurrentPlaylist(currPlaylistId);
    route.push({ pathname: "/audio/player", params: {} });
  };
  return (
    <View className="flex-row items-center px-3 py-2 justify-between bg-amber-200 border-t border-amber-900">
      <PlaylistImage style={{ width: 50, height: 50 }} />
      <TrackPlayerControlsMinimal />
      <View>
        <TouchableOpacity onPress={onPlaylistSelect} className="pr-3">
          <OpenInNewIcon size={30} />
        </TouchableOpacity>
      </View>
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
