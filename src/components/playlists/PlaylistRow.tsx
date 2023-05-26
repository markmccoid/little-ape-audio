import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import React from "react";
import { usePlaybackStore, useTrackActions } from "../../store/store";
import { Playlist, AudioTrack } from "../../store/types";
import { Link, useRouter } from "expo-router";
import { formatSeconds } from "../../utils/formatUtils";
import { usePlaybackState } from "react-native-track-player";

type Props = {
  playlist: Playlist;
};
const PlaylistRow = ({ playlist }: Props) => {
  const trackActions = useTrackActions();
  const setCurrPlaylist = usePlaybackStore(
    (state) => state.actions.setCurrentPlaylist
  );
  const route = useRouter();
  const onPlaylistSelect = async () => {
    await setCurrPlaylist(playlist.id);
    route.push({ pathname: "/audio/player", params: {} });
  };
  return (
    <View className="flex-row justify-between flex-1 mb-2 px-2 flex-grow border-b border-b-amber-700">
      <Pressable onPress={onPlaylistSelect}>
        <Image style={styles.trackImage} source={{ uri: playlist.imageURI }} />
      </Pressable>

      <View className="flex-col flex-grow ml-2 justify-between pb-1">
        <View className="flex-col">
          <Text
            className="text-lg font-ssp_semibold"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {playlist?.name}
          </Text>
          <Text className="text-sm font-ssp_regular" ellipsizeMode="tail">
            {playlist.author}
          </Text>
        </View>
        <Text className="text-sm font-ssp_regular">
          {formatSeconds(playlist.totalDurationSeconds, "minimal")}
        </Text>
      </View>
      <View className="w-[50 align-middle justify-center">
        <TouchableOpacity
          onPress={() => trackActions.removePlaylist(playlist.id)}
        >
          <Text>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  trackImage: {
    width: 100,
    height: 100,
    resizeMode: "stretch",
    borderRadius: 10,
  },
});
export default PlaylistRow;
