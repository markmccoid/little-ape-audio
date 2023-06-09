import { StyleSheet, Image, StyleProp, ImageStyle } from "react-native";
import React, { useMemo } from "react";
import { Playlist } from "../../store/types";
import {
  getCurrentPlaylist,
  usePlaybackStore,
  useTrackActions,
} from "../../store/store";
import { colors } from "../../constants/Colors";

type Props = {
  // IF not playlistId passed, then currentPlaylist is used
  playlistId?: string;
  style?: StyleProp<ImageStyle>;
};
const PlaylistImage = ({ playlistId, style }: Props) => {
  const actions = useTrackActions();
  // let playlist = usePlaybackStore((state) => state.currentPlaylist);
  let playlist = getCurrentPlaylist();
  if (playlistId) {
    playlist = actions.getPlaylist(playlistId);
  }

  const imageSource =
    playlist?.imageType === "uri"
      ? { uri: playlist.imageURI }
      : playlist.imageURI;
  return (
    <>
      {playlist.id && (
        <Image style={[styles.trackImage, style]} source={imageSource} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  trackImage: {
    width: 100,
    height: 100,
    resizeMode: "stretch",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.amber900,
  },
});

export default PlaylistImage;
