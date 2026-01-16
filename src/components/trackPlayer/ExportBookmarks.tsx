import { View, Text, Pressable } from "react-native";
import React, { useState } from "react";
import { SymbolView } from "expo-symbols";
import { usePlaybackStore } from "@store/store";
import usePlaylistColors from "hooks/usePlaylistColors";

const ExportBookmarks = () => {
  const [exportFormat, setExportFormat] = useState<"txt" | "json">("txt");
  const playbackActions = usePlaybackStore((state) => state.actions);
  const playlistColors = usePlaylistColors();
  return (
    <View className="mx-2 flex-row items-center justify-between w-4/5">
      <Pressable
        onPress={() => playbackActions.exportBookmarks(exportFormat)}
        className="flex-row items-center mb-2 px-2 py-1 rounded-xl"
        style={{ borderColor: playlistColors.bgText, backgroundColor: playlistColors.bg }}
      >
        <View className="flex-row items-center justify-start ">
          <Text className="font-semibold pt-[3] pr-1" style={{ color: playlistColors.bgText }}>
            Export Bookmarks
          </Text>
          <SymbolView name="square.and.arrow.down" size={30} tintColor={playlistColors.bgText} />
        </View>
      </Pressable>

      <View className="flex-row items-center space-x-4">
        <Pressable className="flex-row items-center" onPress={() => setExportFormat("txt")}>
          <View
            className={`h-4 w-4 rounded-full border border-amber-900 items-center justify-center mr-1`}
            style={{
              backgroundColor: exportFormat === "txt" ? playlistColors.lightestColor : "white",
            }}
          >
            {exportFormat === "txt" && (
              <View
                className="h-2 w-2 rounded-full bg-amber-900"
                style={{ backgroundColor: playlistColors.darkestColor }}
              />
            )}
          </View>
          <Text style={{ color: playlistColors.bg }}>Text</Text>
        </Pressable>

        <Pressable className="flex-row items-center" onPress={() => setExportFormat("json")}>
          <View
            className={`h-4 w-4 rounded-full border border-amber-900 items-center justify-center mr-1`}
            style={{
              backgroundColor: exportFormat === "json" ? playlistColors.lightestColor : "white",
            }}
          >
            {exportFormat === "json" && (
              <View
                className="h-2 w-2 rounded-full bg-amber-900"
                style={{ backgroundColor: playlistColors.darkestColor }}
              />
            )}
          </View>
          <Text style={{ color: playlistColors.bg }}>JSON</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ExportBookmarks;
