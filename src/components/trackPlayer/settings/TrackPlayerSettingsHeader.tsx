import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import usePlaylistColors from "hooks/usePlaylistColors";
import { getCurrentPlaylist } from "@store/store";

const TrackPlayerSettingsHeader = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const playlistColors = usePlaylistColors();
  const playlist = getCurrentPlaylist();

  return (
    <View
      className={`flex-row py-2 px-2 items-center justify-start`}
      style={{
        backgroundColor: playlistColors.gradientTop,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: playlistColors.gradientTopText,
        // borderTopRightRadius: 11,
      }}
    >
      {/* Playlist Name */}
      <View className="flex-row flex-1 pl-3 pr-1 justify-center">
        <Text
          className="text-base font-bold text-center"
          style={{ color: playlistColors.gradientTopText }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          Settings - {playlist?.name}
        </Text>
      </View>
    </View>
  );
};

export default TrackPlayerSettingsHeader;
