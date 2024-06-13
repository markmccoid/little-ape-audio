import { View, Text, Pressable } from "react-native";
import React from "react";
import { AudioFile } from "@store/data/absTypes";
import { absDownloadItem } from "@store/data/absAPI";
import { buildFilePathLower } from "@store/data/absUtils";

import useDownloadQStore, { DownloadQueueItem } from "@store/store-downloadq";
import { AsteriskIcon, CloseIcon, CloudDownloadIcon } from "@components/common/svg/Icons";
import MemoAnimatedAsterisk from "@components/common/animations/AnimatedAsterisk";
import * as Progress from "react-native-progress";
import { formatBytes } from "@utils/formatUtils";

type Props = {
  bookId: string;
  audio: AudioFile & { path_lower: string; alreadyDownload: boolean };
  index: number;
  totalAudioFiles: number;
};
const ABSFile = ({ bookId, audio, index, totalAudioFiles }: Props) => {
  const activeTasks = useDownloadQStore((state) => state.activeTasks);
  const completedDownloads = useDownloadQStore((state) =>
    state.completedDownloads.map((el) => el.fileId)
  );
  const qActions = useDownloadQStore((state) => state.actions);
  const activeTask = activeTasks.find((task) => task.fileId === audio.ino);
  const isDownloading = activeTask?.processStatus === "downloading";
  const isAdding = activeTask?.processStatus === "adding";
  const isDownloaded = completedDownloads.includes(audio.ino) || audio.alreadyDownload;
  const progress = {
    downloadProgress: activeTask?.downloadProgress,
    bytesExpected: activeTask?.bytesExpected,
    bytesWritten: activeTask?.bytesWritten,
  };

  async function downloadFile(audioIno: string) {
    // const cleanFileName1 = await downloadFileBlob(downloadLink1, file.name, () => {}, audioSource);
    const filename = audio.metadata.filename;
    const downloadLink = absDownloadItem(bookId, audioIno);
    // console.log("DownloadLink", downloadLink);

    const downloadItem: DownloadQueueItem = {
      fileId: audioIno,
      fileName: filename,
      filePathLower: buildFilePathLower(bookId, audioIno),
      pathIn: bookId,
      currFolderText: "currFolderText ABSTEST",
      playlistId: bookId,
      audioSource: "abs",
      calculateColor: true,
      totalAudioFiles,
    };
    qActions.addToQueue(downloadItem);
  }
  return (
    <View className="flex-row flex-1 p-2">
      <View className="flex-row flex-1 justify-start items-center">
        <Text className="pl-1 pr-4">{audio.trackNumFromMeta || index + 1}</Text>
        <Text className="flex-1 " numberOfLines={2} lineBreakMode="tail">
          {audio.metadata.filename}
        </Text>
      </View>
      <View className="flex-row justify-end items-center flex-shrink-0">
        <Text className="ml-3 font-ssp_regular text-base text-amber-950 mr-1">
          {formatBytes(audio.metadata.size)}
        </Text>
        {isDownloaded && (
          <AsteriskIcon color="green" size={20} style={{ marginLeft: 2, marginRight: 2 }} />
        )}
        {!isDownloading && !isDownloaded && !isAdding && (
          <Pressable onPress={async () => await downloadFile(audio.ino)} disabled={isDownloaded}>
            <CloudDownloadIcon />
          </Pressable>
        )}
        {isDownloading && (
          <Pressable onPress={activeTask?.stopDownload}>
            <CloseIcon />
          </Pressable>
        )}
        {isAdding && <MemoAnimatedAsterisk />}
      </View>
      {isDownloading && (
        <View
          style={{
            position: "absolute",
            bottom: 5,
            right: 30,
            backgroundColor: "white",
            borderRadius: 10,
          }}
        >
          <Progress.Bar progress={progress?.downloadProgress} width={250} />
        </View>
      )}
    </View>
  );
};

export default ABSFile;
