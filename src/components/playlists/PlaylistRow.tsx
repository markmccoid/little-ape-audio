import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ImageSourcePropType,
  Alert,
} from "react-native";
import React, { useEffect, useMemo } from "react";
import { usePlaybackStore, useTrackActions } from "../../store/store";
import { Playlist, AudioTrack } from "../../store/types";
import { Link, useRouter } from "expo-router";
import { formatSeconds } from "../../utils/formatUtils";
import PlaylistImage from "../common/PlaylistImage";
import { DeleteIcon, EditIcon } from "../common/svg/Icons";

type Props = {
  playlist: Playlist;
  onPlaylistSelect: (playlistId: string) => void;
};
const PlaylistRow = ({ playlist, onPlaylistSelect }: Props) => {
  const trackActions = useTrackActions();
  const playbackActions = usePlaybackStore((state) => state.actions);
  const currentPlaylistId = usePlaybackStore(
    (state) => state.currentPlaylistId
  );

  const route = useRouter();

  const isActive = useMemo(
    () => currentPlaylistId === playlist.id,
    [currentPlaylistId]
  );

  const handleRemovePlaylist = async () => {
    Alert.alert(
      "Delete Playlist?",
      `Are you sure you want to delete the ${playlist.name} playlist?`,
      [
        {
          text: "Yes",
          onPress: async () => {
            await trackActions.removePlaylist(playlist.id);
            if (currentPlaylistId === playlist.id) {
              await playbackActions.resetPlaybackStore();
            }
          },
        },
        { text: "No", style: "cancel" },
      ]
    );
  };

  const handleEditPlaylist = async () => {
    Alert.prompt("Edit Playlist Name", "Enter a new Playlist Name", [
      {
        text: "OK",
        onPress: (text) =>
          trackActions.updatePlaylistFields(playlist.id, { name: text }),
      },
      { text: "Cancel", onPress: () => {} },
    ]);
  };

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
      <Pressable
        className="flex-1 flex-row"
        onPress={() => onPlaylistSelect(playlist.id)}
      >
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
            {formatSeconds(playlist.totalListenedToSeconds, "minimal")} -
            {formatSeconds(playlist.totalDurationSeconds, "minimal")}
          </Text>
        </View>
      </Pressable>

      {/* DELETE BUTTON */}
      <View
        className="flex-col items-center justify-end "
        style={{ width: 50 }}
      >
        <TouchableOpacity
          className="flex-1 justify-center"
          onPress={handleEditPlaylist}
        >
          <EditIcon />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 justify-center"
          onPress={handleRemovePlaylist}
        >
          <DeleteIcon />
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
