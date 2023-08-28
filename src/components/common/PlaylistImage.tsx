import { StyleSheet, Image, StyleProp, ImageStyle, View } from "react-native";
import React, { useMemo } from "react";
import { Playlist } from "../../store/types";
import {
  getCurrentPlaylist,
  useCurrentPlaylist,
  usePlaybackStore,
  useTrackActions,
} from "../../store/store";
import { colors } from "../../constants/Colors";
import Animated, {
  BounceInDown,
  SlideInLeft,
  ZoomIn,
  ZoomInEasyDown,
  ZoomInEasyUp,
  ZoomOut,
} from "react-native-reanimated";

// Common image dims 128x164 (W * 1.28)

type Props = {
  // IF not playlistId passed, then currentPlaylist is used
  playlistId?: string;
  style?: StyleProp<ImageStyle>;
  noTransition?: boolean;
};
const PlaylistImage = ({ playlistId, style, noTransition = false }: Props) => {
  const actions = useTrackActions();

  // let playlist = usePlaybackStore((state) => state.currentPlaylist);
  // let playlist = getCurrentPlaylist();
  let playlist = useCurrentPlaylist();
  if (playlistId) {
    playlist = actions.getPlaylist(playlistId);
  }
  const aspectRatio = playlist?.imageAspectRatio || 1.28;

  return (
    <>
      {playlist && playlist.id && (
        <Animated.View entering={ZoomInEasyUp} style={[styles.shadow, style]}>
          <Animated.Image
            style={[styles.trackImage, style]}
            source={{ uri: playlist.imageURI }}
          />
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  trackImage: {
    width: 100,
    height: 100 * 1.28,
    borderRadius: 10,
    resizeMode: "cover",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.amber900,
  },
  shadow: {
    borderRadius: 10,
    backgroundColor: colors.amber100,
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
