import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { AudioFile } from "@store/data/absTypes";
import useDownloadQStore, {
  DownloadQueueItem,
  useDownloadQDownloadCounts,
  useDownloadQStatus,
} from "@store/store-downloadq";
import { MotiView } from "moti";
import { AsteriskIcon, CloseIcon, CloudDownloadIcon } from "@components/common/svg/Icons";
import { buildFilePathLower } from "@store/data/absUtils";

type Props = {
  audio: (AudioFile & { path_lower: string; alreadyDownload: boolean })[];
  bookId: string;
  filesDownloaded: number;
};
const ABSActionBar = ({ audio, bookId, filesDownloaded }: Props) => {
  const qActions = useDownloadQStore((state) => state.actions);
  const isDownloading = useDownloadQStore((state) => state.isDownloading);

  const folderPath = bookId;
  const fileCount = audio.length;

  const { lastTaskAdding, pathHasActiveTasks, stopAllInProgress } = useDownloadQStatus({
    folderPath,
    fileCount,
    filesDownloaded,
  });
  const { stopAllDownloads, undownloadedFileCount } = useDownloadQDownloadCounts({
    folderPath,
    fileCount,
    filesDownloaded,
  });

  const handleDownloadAll = () => {
    //-- Create a playlist ID
    const playlistId = bookId;
    //-- Add the files to the download queue
    let i = 0;
    for (let file of audio.filter((el) => el.alreadyDownload === false)) {
      const downloadItem: DownloadQueueItem = {
        fileId: file.ino,
        fileName: file.metadata.filename,
        filePathLower: buildFilePathLower(bookId, file.ino),
        pathIn: bookId,
        currFolderText: "currFolderText ABSTEST",
        playlistId: bookId,
        audioSource: "abs",
        calculateColor: i === 0 ? true : false,
      };
      i++;
      qActions.addToQueue(downloadItem);
    }
  };

  return (
    <View className="flex-row justify-end pr-4 bg-amber-50">
      {/* DOWNLOAD ALL Button */}
      {fileCount > 0 && (
        <View className="flex-shrink flex justify-end">
          {!pathHasActiveTasks && (
            <TouchableOpacity
              className="flex-row flex-grow items-center space-x-1 pl-2 py-1"
              style={{ opacity: undownloadedFileCount === 0 ? 0.5 : 1 }}
              onPress={async () => handleDownloadAll()}
              disabled={undownloadedFileCount === 0}
            >
              <CloudDownloadIcon />
              <Text>All</Text>
            </TouchableOpacity>
          )}
          {isDownloading && !lastTaskAdding && pathHasActiveTasks && (
            <TouchableOpacity
              className="flex-row flex-grow items-center space-x-1 pl-2 py-1 "
              onPress={() => stopAllDownloads()}
              disabled={stopAllInProgress}
            >
              {!stopAllInProgress && <CloseIcon />}
              <Text>{`${stopAllInProgress ? "Stopping..." : "Stop"}`}</Text>
            </TouchableOpacity>
          )}
          {lastTaskAdding && pathHasActiveTasks && (
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

export default ABSActionBar;
