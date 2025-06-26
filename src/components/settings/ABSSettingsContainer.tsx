import { View, StyleSheet, Pressable, Text, Switch } from "react-native";
import React, { useState } from "react";
import AbsAuth from "../../components/dropbox/AbsAuth";
import { colors } from "../../constants/Colors";
import { Link } from "expo-router";

import { IOSArrowForwardIcon } from "../../components/common/svg/Icons";
import { useSettingStore } from "../../store/store-settings";
import InfoPopup from "@components/common/InfoPopup";

const ABSSettingsContainer = () => {
  const toggleSyncProgress = useSettingStore((state) => state.actions.toggleSyncProgress);
  const toggleSyncBookmarks = useSettingStore((state) => state.actions.toggleSyncBookmarks);
  const absSyncProgress = useSettingStore((state) => state.absSyncProgress);
  const absSyncBookmarks = useSettingStore((state) => state.absSyncBookmarks);
  const [syncProgress, setSyncProgress] = useState(absSyncProgress);
  const [syncBookmarks, setSyncBookmarks] = useState(absSyncBookmarks);
  return (
    <View>
      <AbsAuth />
      {/* ------------------ */}
      {/* ABS Settings       */}
      {/* ------------------ */}
      <View
        className="px-2 py-1"
        style={[styles.borderBottom, { borderTopWidth: StyleSheet.hairlineWidth }]}
      >
        <View className="flex-row items-center justify-start">
          <Text className="text-sm mr-4">Sync Progress To ABS</Text>
          <InfoPopup
            title="Sync Progress To ABS"
            infoText={`Syncs the progress of your audiobooks to the ABS server. The server time is updated three ways: 
1) When hit the Play button 
2) When you hit the Pause button
3) Every 60 seconds as you are listening to the book.

If you want to sync FROM the Server TO LAAB, you can manually do this from the Track Settings page in each book.`}
          />
        </View>
        <Switch
          style={{ marginRight: -10, transform: [{ scaleY: 0.7 }, { scaleX: 0.7 }] }}
          trackColor={{ false: "#767577", true: "#4caf50" }}
          thumbColor={syncProgress ? "#8bc34a" : "#ddd"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={async () => {
            setSyncProgress(!syncProgress);
            await toggleSyncProgress();
          }}
          value={syncProgress}
        />
      </View>
      <View className="px-2 py-1" style={[styles.borderBottom]}>
        <View className="flex-row items-center justify-start">
          <Text className="text-sm mr-4">Sync Bookmarks To ABS</Text>
          <InfoPopup
            title="Sync Bookmarks To ABS"
            infoText={`When this setting is on,Bookmarks are synced as follows:

- Automatic Sync: Bookmarks sync with the ABS server whenever you open LAAB. Bookmarks from your phone and the server are combined/merged for each book.

- Manual Sync: To update LAAB with bookmarks from the ABS server, go to the Track Settings page for each book.

- Important Note: LAAB is the primary source for bookmarks. Deleting a bookmark in LAAB removes it from the ABS server too. However, deleting a bookmark on the ABS server does not remove it from LAAB.`}
          />
        </View>
        <Switch
          style={{ marginRight: -10, transform: [{ scaleY: 0.7 }, { scaleX: 0.7 }] }}
          trackColor={{ false: "#767577", true: "#4caf50" }}
          thumbColor={syncBookmarks ? "#8bc34a" : "#ddd"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={async () => {
            setSyncBookmarks(!syncBookmarks);
            await toggleSyncBookmarks();
          }}
          value={syncBookmarks}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.amber600,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 15,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
});

export default ABSSettingsContainer;
