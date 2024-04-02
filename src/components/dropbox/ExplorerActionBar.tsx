import { View, Text, StyleSheet, Pressable, TouchableOpacity } from "react-native";
import React from "react";
import {
  AsteriskIcon,
  CloseIcon,
  CloudDownloadIcon,
  EyeOffOutlineIcon,
  EyeOutlineIcon,
} from "../common/svg/Icons";
import { MotiView } from "moti";
import { colors } from "@constants/Colors";
import { useDropboxStore } from "@store/store-dropbox";
import { useShallow } from "zustand/react/shallow";
import { AudioSourceType } from "@app/audio/dropbox";
import useDownloadQStore from "@store/store-downloadq";

type Props = {
  // currentPath: string;
  audioSource: AudioSourceType;
  // total files in directory
  fileCount: number;
  folderCount: number;
  // how many files have been downloaded
  filesDownloaded: number;
  displayMetadata: boolean;
  hasMetadata: boolean;
  handleDownloadAll: () => Promise<void>;
  handleDisplayMetadata: () => void;
};

const ExplorerActionBar = ({
  // currentPath,
  audioSource,
  fileCount,
  folderCount,
  filesDownloaded,
  displayMetadata,
  hasMetadata,
  handleDownloadAll,
  handleDisplayMetadata,
}: Props) => {
  const metadataProcessingFlag = useDropboxStore(
    (state) => state.folderMetadataProcessingInfo.metadataProcessingFlag
  );
  const metadataCurrentTask = useDropboxStore(
    (state) => state.folderMetadataProcessingInfo.currentTask
  );
  //! download queue info
  const stopAllDownloads = useDownloadQStore((state) => state.actions.stopAllDownloads);
  const isDownloading = useDownloadQStore((state) => state.activeTasks.length > 0);
  // lets us know that we are on the last item in the queue and it is being added to a playlist, can't be stopped now
  const lastTaskAdding = useDownloadQStore(
    (state) => state.activeTasks.length === 1 && state.activeTasks[0].processStatus === "adding"
  );
  const downloadedItemCount = useDownloadQStore((state) => state.completedDownloads.length);
  const finalDownloadedCount = (filesDownloaded || 0) + (downloadedItemCount || 0);
  const undownloadedFileCount = fileCount - (finalDownloadedCount || 0);
  //!

  // console.log("ActionBAr tasks", metadataCurrentTask, metadataProcessingFlag);
  return (
    <View className="flex flex-row items-center justify-end mt-1 pb-1 pr-2 border-b border-black">
      {/* DOWNLOAD METADATA Button */}
      {folderCount > 0 ? (
        <View
          className="flex flex-row justify-between items-center flex-1"
          // style={{ display: "flex" }}
          style={{ display: hasMetadata ? "flex" : "none" }}
        >
          <TouchableOpacity onPress={handleDisplayMetadata} className="mx-2 ">
            {displayMetadata ? <EyeOutlineIcon /> : <EyeOffOutlineIcon />}
          </TouchableOpacity>
          <View className="mr-1 flex-1 items-center flex flex-row">
            {metadataProcessingFlag && (
              <Text lineBreakMode="tail" numberOfLines={2} className="flex-1">
                {metadataCurrentTask}
              </Text>
            )}
          </View>
        </View>
      ) : (
        // This is a placeholder so the justify between keeps icons in correct place
        <View />
      )}

      {/* DOWNLOAD ALL Button */}
      {fileCount > 0 && (
        <View className="flex-shrink flex justify-end">
          {!isDownloading && (
            <TouchableOpacity
              className="flex-row flex-grow items-center space-x-1 pl-2 py-1"
              style={{ opacity: undownloadedFileCount === 0 ? 0.5 : 1 }}
              onPress={async () => await handleDownloadAll()}
              disabled={undownloadedFileCount === 0}
            >
              <CloudDownloadIcon />
              <Text>All</Text>
            </TouchableOpacity>
          )}
          {isDownloading && !lastTaskAdding && (
            <TouchableOpacity
              className="flex-row flex-grow items-center space-x-1 pl-2 py-1 "
              onPress={() => stopAllDownloads()}
            >
              <CloseIcon />
              <Text>Stop</Text>
            </TouchableOpacity>
          )}
          {lastTaskAdding && (
            <MotiView
              className="flex-row items-center py-1"
              from={{ rotate: "0deg", opacity: 0.6 }}
              animate={{ rotate: "360deg" }}
              transition={{
                type: "timing",
                duration: 2000, // Duration of one rotation
                loop: true, // Repeat the animation indefinitely
              }}
            >
              <AsteriskIcon color="gray" style={{ marginLeft: 2, marginRight: 2 }} />
            </MotiView>
          )}
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
