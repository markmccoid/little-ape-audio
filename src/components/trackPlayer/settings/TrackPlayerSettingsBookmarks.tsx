import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useMemo, useState } from "react";
import { usePlaybackState } from "react-native-track-player";
import { usePlaybackStore } from "../../../store/store";
import { ScrollView } from "react-native-gesture-handler";
import { formatSeconds } from "../../../utils/formatUtils";
import { useRouter } from "expo-router";
import { colors } from "../../../constants/Colors";

const TrackPlayerSettingsBookmarks = () => {
  const playbackActions = usePlaybackStore((state) => state.actions);
  const router = useRouter();
  const [updateBookmarks, setUpdateBookmarks] = useState(false);
  const bookmarks = useMemo(
    () => playbackActions.getBookmarks(),
    [updateBookmarks]
  );

  const handleApplyBookmark = async (bookmarkId) => {
    playbackActions.applyBookmark(bookmarkId);
    router.back();
  };
  const handleDeleteBookmark = async (bookmarkId) => {
    playbackActions.deleteBookmark(bookmarkId);
    setUpdateBookmarks((prev) => !prev);
  };

  if (!bookmarks || bookmarks?.length === 0) {
    return (
      <View className="w-full border border-amber-900 rounded-md bg-white p-3">
        <Text>No Bookmarks</Text>
      </View>
    );
  }
  return (
    <ScrollView
      className="w-full border border-amber-900 rounded-md bg-white flex-grow"
      contentContainerStyle={{ marginBottom: 300 }}
      style={{ paddingBottom: 300 }}
    >
      {bookmarks &&
        bookmarks.map((el) => {
          return (
            <TouchableOpacity
              key={el.id}
              onPress={async () => handleApplyBookmark(el.id)}
              onLongPress={async () => handleDeleteBookmark(el.id)}
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
  );
};

export default TrackPlayerSettingsBookmarks;
