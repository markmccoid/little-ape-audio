import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ImageSourcePropType,
} from "react-native";
import React from "react";
import { usePlaybackStore, useTrackActions } from "../../store/store";
import { Playlist, AudioTrack } from "../../store/types";
import { Link, useRouter } from "expo-router";
import { formatSeconds } from "../../utils/formatUtils";

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

  const imageSource =
    playlist?.imageType === "uri"
      ? { uri: playlist.imageURI }
      : playlist.imageURI;
  // console.log("IMAE URI", image5, playlist.imageURI);
  return (
    <View className="flex-row  mb-2 py-2 px-2 border-b border-b-amber-700">
      {/* IMAGE */}
      <Pressable onPress={onPlaylistSelect}>
        <Image style={styles.trackImage} source={imageSource} />
      </Pressable>

      {/* TITLE AUTHOR LENGTH */}
      <View className="flex-col flex-1 flex-grow ml-2 justify-between pb-1 ">
        <View className="flex-col flex-shrink">
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

      {/* DELETE BUTTON */}
      <View
        className="flex-row items-center justify-center"
        style={{ width: 50 }}
      >
        <TouchableOpacity
          className="flex-1"
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
