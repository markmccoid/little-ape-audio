import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { CloudDownloadIcon, DatabaseDownloadIcon } from "../common/svg/Icons";

type Props = {
  currentPath: string;
  fileCount: number;
  handleDownloadAll: () => void;
  handleDownloadMetadata: () => void;
};
const ExplorerActionBar = ({
  currentPath,
  fileCount,
  handleDownloadAll,
  handleDownloadMetadata,
}: Props) => {
  return (
    <View className="flex flex-row items-center justify-between mt-1 pb-1 pr-2 flex-grow-1 border-b border-black">
      <TouchableOpacity onPress={handleDownloadMetadata} className="ml-2">
        <DatabaseDownloadIcon />
      </TouchableOpacity>
      {/* <View className="flex flex-grow-1">
        <Text className="text-sm font-ssp_regular text-amber-900 px-2 pt-1 pb-2">
          {currentPath.length === 0 ? "/" : currentPath}
        </Text>
      </View> */}
      {/* <View className="flex-row">
          <TouchableOpacity
            disabled={currentPath.length === 0}
            onPress={onHandleBack}
            className="border border-black"
          >
            <Text className="px-4 py-2">Back</Text>
          </TouchableOpacity>
          <Text className="px-4 py-2 ">Favorites</Text>
        </View> */}
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
