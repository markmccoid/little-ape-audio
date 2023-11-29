import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ImageSourcePropType,
  Alert,
  Animated as RNAnimated,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { usePlaybackStore, useTrackActions } from "../../store/store";
import { Playlist, AudioTrack } from "../../store/types";
import { Link, router, useRouter } from "expo-router";
import { formatSeconds } from "../../utils/formatUtils";
import PlaylistImage from "../common/PlaylistImage";
import { DeleteIcon, EditIcon, ImageIcon } from "../common/svg/Icons";
import { getImageFromWeb } from "@utils/otherUtils";
import { Swipeable } from "react-native-gesture-handler";
import { colors } from "@constants/Colors";
import usePlaylistColors from "hooks/usePlaylistColors";
import { LinearGradient } from "expo-linear-gradient";
// import * as WebBrowser from "expo-web-browser";
// import * as Clipboard from "expo-clipboard";
// import { getImageSize } from "@utils/audioUtils";

type Props = {
  playlist: Playlist;
  onPlaylistSelect: (playlistId: string) => void;
  index: number;
  renderRowRefs: Swipeable[];
  closeRow: (index: number) => void;
};
const PlaylistRow = ({ playlist, onPlaylistSelect, index, renderRowRefs, closeRow }: Props) => {
  const trackActions = useTrackActions();
  const playbackActions = usePlaybackStore((state) => state.actions);
  const currentPlaylistId = usePlaybackStore((state) => state.currentPlaylistId);

  const isActive = useMemo(() => currentPlaylistId === playlist.id, [currentPlaylistId]);
  const playlistColors = usePlaylistColors(playlist.id);

  const handleRemovePlaylist = async () => {
    Alert.alert(
      "Delete Playlist?",
      `Are you sure you want to delete the ${playlist.name} playlist?`,
      [
        {
          text: "Yes",
          onPress: async () => {
            if (currentPlaylistId === playlist.id) {
              await playbackActions.resetPlaybackStore();
            }
            await trackActions.removePlaylist(playlist.id);
          },
        },
        { text: "No", style: "cancel" },
      ]
    );
  };

  return (
    <Swipeable
      ref={(ref) => (renderRowRefs[index] = ref)}
      onSwipeableOpen={() => closeRow(index)}
      renderRightActions={(progress, dragX) => {
        return (
          <RenderRight
            handleRemovePlaylist={handleRemovePlaylist}
            playlistId={playlist.id}
            progress={progress}
            dragX={dragX}
          />
        );
      }}
      rightThreshold={45}
      leftThreshold={10}
    >
      <LinearGradient
        colors={[playlistColors.gradientTop, playlistColors.gradientLast]}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 0 }}
        // locations={[0.001, 1]}
      >
        <View
          className={`flex-row flex-1 pt-2 pb-3 px-2 border-r border-r-amber-800 ${
            // isActive ? "bg-amber-300" : "bg-amber-50"
            isActive
          }`}
          // style={{ backgroundColor: playlistColors.gradientTop }}
        >
          <Pressable className="flex-1 flex-row" onPress={() => onPlaylistSelect(playlist.id)}>
            {/* IMAGE */}
            <PlaylistImage style={styles.trackImage} playlistId={playlist.id} noTransition />
            {/* TITLE AUTHOR LENGTH */}
            <View className="flex-col flex-1 ml-2 justify-between pb-1 ">
              <View className="flex-col flex-shrink">
                <Text className="text-lg font-ssp_semibold" numberOfLines={2} ellipsizeMode="tail">
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
        </View>
      </LinearGradient>
    </Swipeable>
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

//~ ========================================================================
//~ Render the Right swipe buttons
//~ ========================================================================
function RenderRight({
  handleRemovePlaylist,
  playlistId,
  progress,
  dragX,
}: {
  handleRemovePlaylist;
  playlistId: string;
  progress: RNAnimated.AnimatedInterpolation<string | number>;
  dragX: RNAnimated.AnimatedInterpolation<string | number>;
}) {
  const drag = dragX.interpolate({
    inputRange: [-400, -82, 0],
    outputRange: [82 - 400, 0, 82],
    extrapolate: "clamp",
  });
  const iconScale = progress.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1.1, 1.8],
    extrapolate: "clamp",
  });

  return (
    <RNAnimated.View
      className="flex-row items-center justify-center w-[82] bg-amber-200 "
      style={{ opacity: progress, transform: [{ translateX: drag }] }}
    >
      {/* EDIT BUTTON */}
      <View className="flex-col items-center justify-end">
        <TouchableOpacity
          className="flex-row flex-1 items-center justify-center"
          style={{
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.amber800,
            borderTopWidth: 0,
          }}
          // onPress={handleEditPlaylist}
          onPress={() => {
            // router.setParams({ playlistId: playlist.id });
            router.push({
              pathname: "/audio/playlistedit",
              params: { playlistId: playlistId },
            });
          }}
        >
          <RNAnimated.View
            className="w-full items-center"
            style={{ transform: [{ scale: iconScale }] }}
          >
            <EditIcon />
          </RNAnimated.View>
        </TouchableOpacity>
        {/* DELETE BUTTON */}
        <TouchableOpacity
          className="flex-row flex-1 items-center justify-center"
          onPress={handleRemovePlaylist}
          style={{
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.amber800,
            // borderTopWidth: 0,
            borderBottomWidth: 0,
          }}
        >
          {/* <DeleteIcon /> */}
          <RNAnimated.View
            className="w-full items-center"
            style={{ transform: [{ scale: iconScale }] }}
          >
            <DeleteIcon color={colors.deleteRed} />
          </RNAnimated.View>
        </TouchableOpacity>
      </View>
    </RNAnimated.View>
  );
}
