import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { usePlaybackState } from "react-native-track-player";
import { usePlaybackStore } from "../../../store/store";
import { ScrollView } from "react-native-gesture-handler";
import { formatSeconds } from "../../../utils/formatUtils";
import { useRouter } from "expo-router";
import { colors } from "../../../constants/Colors";

const TrackPlayerSettingsBookmarks = () => {
  const playbackActions = usePlaybackStore((state) => state.actions);
  const router = useRouter();

  const handleApplyBookmark = async (bookmarkId) => {
    playbackActions.applyBookmark(bookmarkId);
    router.back();
  };
  return (
    <View className="w-full">
      <ScrollView className="w-full border border-amber-900 rounded-sm bg-white">
        {playbackActions.getBookmarks().map((el) => {
          return (
            <TouchableOpacity
              key={el.id}
              onPress={async () => handleApplyBookmark(el.id)}
              className="flex-col justify-between px-1 py-2"
              style={{
                borderBottomColor: colors.amber800,
                borderBottomWidth: StyleSheet.hairlineWidth,
              }}
            >
              <View className="flex-row justify-between flex-1">
                <Text className="font-semibold">{el.name}</Text>
                <Text>{formatSeconds(el.positionSeconds)}</Text>
              </View>
              <Text>Track: {el.trackId}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default TrackPlayerSettingsBookmarks;
