import { View, Text, StyleSheet, Pressable, TouchableOpacity } from "react-native";
import React from "react";
import {
  CloudDownloadIcon,
  DatabaseDownloadIcon,
  EyeOffOutlineIcon,
  EyeOutlineIcon,
} from "../common/svg/Icons";
import { MotiView } from "moti";
import { colors } from "@constants/Colors";
import { useDropboxStore } from "@store/store-dropbox";

type Props = {
  currentPath: string;
  fileCount: number;
  folderCount: number;
  showMetadata: "on" | "off" | "loading";
  displayMetadata: boolean;
  handleDownloadAll: () => void;
  handleDownloadMetadata: () => void;
  handleDisplayMetadata: () => void;
};

const ExplorerActionBar = ({
  currentPath,
  fileCount,
  folderCount,
  showMetadata,
  displayMetadata,
  handleDownloadAll,
  handleDownloadMetadata,
  handleDisplayMetadata,
}: Props) => {
  const metadataProcessingFlag = useDropboxStore(
    (state) => state.folderMetadataProcessingInfo.metadataProcessingFlag
  );
  const metadataTasks = useDropboxStore(
    (state) => state.folderMetadataProcessingInfo.metadataTasks
  );
  console.log("PROCESSING FLAG", metadataTasks);
  return (
    <View className="flex flex-row items-center justify-between mt-1 pb-1 pr-2 flex-grow-1 border-b border-black">
      {/* DOWNLOAD METADATA Button */}
      {folderCount > 0 ? (
        <>
          <TouchableOpacity onPress={handleDisplayMetadata} className="mx-2">
            {displayMetadata ? <EyeOutlineIcon /> : <EyeOffOutlineIcon />}
          </TouchableOpacity>
          <View className="mr-5">
            {metadataProcessingFlag && <Text>{metadataTasks.slice(metadataTasks.length - 1)}</Text>}
          </View>
          <TouchableOpacity
            onPress={() => handleDownloadMetadata()}
            className="mx-2"
            disabled={metadataProcessingFlag}
          >
            <MotiView
              key={metadataProcessingFlag.toString()}
              from={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{
                loop: metadataProcessingFlag ? true : false,
                type: "timing",
                duration: 500,
              }}
            >
              <DatabaseDownloadIcon
                color={metadataProcessingFlag ? colors.amber600 : colors.amber900}
              />
            </MotiView>
          </TouchableOpacity>
        </>
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
