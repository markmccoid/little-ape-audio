import { View, Text, Pressable, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import { getCurrentPlaylist, useTrackActions } from "../../store/store";
import { SettingsIcon } from "@components/common/svg/Icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import IOSBack from "@components/common/svg/IOSBack";
import { TouchableOpacity } from "react-native-gesture-handler";
import usePlaylistColors from "hooks/usePlaylistColors";

const PlayerHeaderComponent = ({ playlistId }: { playlistId: string }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const playlist = useTrackActions().getPlaylist(playlistId);
  const playlistColors = usePlaylistColors(playlistId);

  return (
    <View
      className={`flex-row px-2 items-center justify-start`}
      style={{ backgroundColor: playlistColors?.secondary?.color, paddingTop: insets.top - 5 }}
    >
      <StatusBar
        barStyle={
          playlistColors?.secondary?.colorType === "light" ? "dark-content" : "light-content"
        }
      />
      {/* Back Icon */}
      <TouchableOpacity onPress={() => router.back()} className="flex-row items-center w-[25]">
        <IOSBack strokeColor={playlistColors?.secondary?.tintColor} />
      </TouchableOpacity>

      {/* Playlist Name */}
      <View className="flex-row flex-1 pl-3 pr-1 justify-center">
        <Text
          className="text-base font-bold text-amber-950 text-center"
          style={{ color: playlistColors?.secondary?.tintColor }}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {playlist?.name}
        </Text>
      </View>

      {/* Settings Icon */}
      <View className="">
        <Link href="/audio/playersettings" asChild>
          <Pressable className="p-[10] mr-[-10]">
            <SettingsIcon size={25} color={playlistColors?.secondary?.tintColor} />
          </Pressable>
        </Link>
      </View>
    </View>
  );
};

export default PlayerHeaderComponent;
