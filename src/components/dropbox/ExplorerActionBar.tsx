import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { CloudDownloadIcon, DatabaseDownloadIcon } from "../common/svg/Icons";
import { MotiView } from "moti";
import { colors } from "@constants/Colors";

type Props = {
  currentPath: string;
  fileCount: number;
  folderCount: number;
  showMetadata: "on" | "off" | "loading";
  handleDownloadAll: () => void;
  handleDownloadMetadata: () => void;
};

const ExplorerActionBar = ({
  currentPath,
  fileCount,
  folderCount,
  showMetadata,
  handleDownloadAll,
  handleDownloadMetadata,
}: Props) => {
  return (
    <View className="flex flex-row items-center justify-between mt-1 pb-1 pr-2 flex-grow-1 border-b border-black">
      {/* DOWNLOAD METADATA Button */}
      {folderCount > 0 ? (
        <TouchableOpacity onPress={handleDownloadMetadata} className="ml-2">
          <MotiView
            from={{ transform: [{ rotate: "-90deg" }] }}
            animate={{
              transform: [
                { rotate: showMetadata !== "off" ? "0deg" : "-90deg" },
              ],
            }}
          >
            <DatabaseDownloadIcon
              color={showMetadata !== "off" ? colors.amber600 : colors.amber900}
            />
          </MotiView>
        </TouchableOpacity>
      ) : (
        // This is a placeholder so the justify between keeps icons in correct place
        <View />
      )}

      {/* DOWNLOAD ALL Button */}
      {fileCount > 0 && (
        <View className="ml-2 ">
          <TouchableOpacity
            className="flex-row items-center space-x-1 px-2 py-1 "
            onPress={handleDownloadAll}
          >
            <CloudDownloadIcon />
            <Text>All</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 5,
  },
});
export default ExplorerActionBar;
