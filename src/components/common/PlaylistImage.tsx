import { StyleSheet, Image, StyleProp, ImageStyle, View } from "react-native";
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
        <View style={styles.shadow}>
          <Image style={[styles.trackImage, style]} source={imageSource} />
        </View>
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
  shadow: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5.62,
  },
});

export default PlaylistImage;
