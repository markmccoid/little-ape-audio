import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ImageSourcePropType,
} from "react-native";
import React, { useMemo } from "react";
import { usePlaybackStore, useTrackActions } from "../../store/store";
import { Playlist, AudioTrack } from "../../store/types";
import { Link, useRouter } from "expo-router";
import { formatSeconds } from "../../utils/formatUtils";
import PlaylistImage from "../common/PlaylistImage";

type Props = {
  playlist: Playlist;
};
const PlaylistRow = ({ playlist }: Props) => {
  const trackActions = useTrackActions();
  const currentPlaylistId = usePlaybackStore(
    (state) => state.currentPlaylistId
  );
  const setCurrPlaylist = usePlaybackStore(
    (state) => state.actions.setCurrentPlaylist
  );
  const route = useRouter();
  const onPlaylistSelect = async () => {
    await setCurrPlaylist(playlist.id);
    route.push({ pathname: "/audio/player", params: {} });
  };
  const isActive = useMemo(
    () => currentPlaylistId === playlist.id,
    [currentPlaylistId]
  );

  const imageSource =
    playlist?.imageType === "uri"
      ? { uri: playlist.imageURI }
      : playlist.imageURI;
  // console.log("IMAE URI", image5, playlist.imageURI);
  return (
    <View
      className={`flex-row flex-1 py-2 px-2 border-b border-b-amber-700 ${
        isActive ? "bg-amber-300" : ""
      }`}
    >
      <Pressable className="flex-1 flex-row" onPress={onPlaylistSelect}>
        {/* IMAGE */}
        {/* <Image style={styles.trackImage} source={imageSource} /> */}
        <PlaylistImage style={styles.trackImage} playlistId={playlist.id} />
        {/* TITLE AUTHOR LENGTH */}
        <View className="flex-col flex-1 ml-2 justify-between pb-1 ">
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
      </Pressable>

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
