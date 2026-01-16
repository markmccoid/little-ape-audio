import { View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePlaybackState } from "react-native-track-player";
import { usePlaybackStore } from "../../../store/store";
import { ScrollView } from "react-native-gesture-handler";
import { formatSeconds } from "../../../utils/formatUtils";
import { useRouter, useSegments } from "expo-router";
import { colors } from "../../../constants/Colors";
import { useSharedValue } from "react-native-reanimated";
import BookmarkRow from "../settings/TrackPlayerSettingsBookmarkRow";
import { useSettingStore } from "@store/store-settings";
import { useUIStore } from "@store/store-ui";
import { SymbolView } from "expo-symbols";
import ExportBookmarks from "../ExportBookmarks";

const BottomSheetsBookmarks = () => {
  //-- Setup for swipe left gestures
  const scrollRef = useRef(null);
  const activeKey = useSharedValue(undefined);
  //--
  const playbackActions = usePlaybackStore((state) => state.actions);
  // I'm sure there is a better way BUT....
  // This forces a rerender when a bookmark is deleted
  const didUpdate = usePlaybackStore((state) => state.didUpdate);
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState(playbackActions.getBookmarks());
  const segments = useSegments();
  const playerBottomSheetRef = useSettingStore((state) => state.playerBottomSheetRef);
  const bookmarkModalVisible = useUIStore((state) => state.bookmarkModalVisible);

  useEffect(() => {
    if (!bookmarkModalVisible) {
      setBookmarks(playbackActions.getBookmarks());
    }
  }, [bookmarkModalVisible]);

  const handleApplyBookmark = async (bookmarkId) => {
    const currSegment = segments[segments.length - 1];
    playbackActions.applyBookmark(bookmarkId);
    // Need to know if we are in route or if we are on bottomsheet
    if (currSegment === "playersettings") {
      router.back();
    } else {
      playerBottomSheetRef.close();
    }
  };
  const handleDeleteBookmark = async (bookmarkId) => {
    playbackActions.deleteBookmark(bookmarkId);
  };

  if (!bookmarks || bookmarks?.length === 0) {
    return (
      <View className="mx-2 border border-amber-900 rounded-md bg-white p-3">
        <Text>No Bookmarks</Text>
      </View>
    );
  }

  return (
    <View>
      <ExportBookmarks />
      <ScrollView ref={scrollRef} style={{ marginHorizontal: 10, marginTop: 5 }}>
        {bookmarks &&
          bookmarks.map((el) => {
            return (
              <BookmarkRow
                key={el.id}
                bookmark={el}
                activeKey={activeKey}
                simultaneousHandler={scrollRef}
                onApplyBookmark={handleApplyBookmark}
                onDeleteBookmark={handleDeleteBookmark}
              />
            );
          })}
      </ScrollView>
    </View>
  );
};

export default BottomSheetsBookmarks;
