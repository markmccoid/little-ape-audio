import { View, Text, Pressable, StyleSheet, Easing } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { FileEntry, getDropboxFileLink } from "../../utils/dropboxUtils";
import { AsteriskIcon, CloseIcon, CloudDownloadIcon } from "../common/svg/Icons";
import { formatBytes } from "../../utils/formatUtils";
import { colors } from "../../constants/Colors";
import {
  DownloadProgress,
  downloadFileBlob,
  getCleanFileName,
} from "../../store/data/fileSystemAccess";
import { usePlaybackStore, useTrackActions } from "../../store/store";
import * as Progress from "react-native-progress";
import { AudioSourceType } from "@app/(audio)/dropbox";
// import { DownloadProgressCallbackResultT } from "@dr.pogodin/react-native-fs";
import useDownloadQStore, { DownloadQueueItem } from "@store/store-downloadq";
import { MotiView } from "moti";
import MemoAnimatedAsterisk from "@components/common/animations/AnimatedAsterisk";

type Props = {
  file: FileEntry;
  audioSource: AudioSourceType;
  // This will be the path or folderId (google) of the folder the file resides in
  // Google will need this to AddTrack can look for metadata files.
  pathIn: string;
  // Text of current folder
  currFolderText: string;
  playlistId?: string;
};
const ExplorerFile = ({ file, playlistId, audioSource, pathIn, currFolderText }: Props) => {
  //! NEW
  const activeTasks = useDownloadQStore((state) => state.activeTasks);
  const completedDownloads = useDownloadQStore((state) =>
    state.completedDownloads.map((el) => el.fileId)
  );
  const qActions = useDownloadQStore((state) => state.actions);
  //!
  const isDropbox = !!(audioSource === "dropbox");
  const isGoogle = !!(audioSource === "google");
  const trackActions = useTrackActions();
  const playlistLoaded = usePlaybackStore((state) => state.playlistLoaded);
  const resetPlaybackStore = usePlaybackStore((state) => state.actions.resetPlaybackStore);
  const [progress2, setProgress] = useState<DownloadProgress>();

  const [isDownloading2, setIsDownloading] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [isDownloaded2, setIsDownloaded] = useState(file.alreadyDownload);

  const stopDownloadRef = useRef<() => void>();
  //! NEW
  const activeTask = activeTasks.find((task) => task.fileId === file.id);
  const isDownloading = activeTask?.processStatus === "downloading";
  const isAdding = activeTask?.processStatus === "adding";
  const isDownloaded = completedDownloads.includes(file.id) || file.alreadyDownload;
  const progress = {
    downloadProgress: activeTask?.downloadProgress,
    bytesExpected: activeTask?.bytesExpected,
    bytesWritten: activeTask?.bytesWritten,
  };
  //!
  //!---------
  useEffect(() => {
    // Using the playlistId as the trigger to download a file
    // If the playlistId is populated, then start downloading this file
    const checkAndDownload = async () => {
      if (playlistId) {
        if (!isDownloaded) {
          await downloadFile(file);
        }
      }
    };
    checkAndDownload();
  }, [playlistId]);
  //! Uncomment to stop all downloads when moving away from folder
  // useEffect(() => {
  //   return () => {
  //     if (stopDownloadRef?.current) {
  //       stopDownloadRef.current();
  //     }
  //   };
  // }, []);
  //~ --- stopDownload of file -----
  const stopDownload = () => {
    console.log("IN StopDownload");
    setStopped(true);
    setIsDownloaded(false);
    setIsDownloading(false);
    // this ref has a function that will cancel the download
    stopDownloadRef?.current && stopDownloadRef.current();
  };
  //~ --- downloadFile function to download file while setting progress state --------------
  const downloadFile = async (file: FileEntry) => {
    // const downloadLink1 = isGoogle ? file.id : await getDropboxFileLink(file.path_lower);
    // // const cleanFileName1 = await downloadFileBlob(downloadLink1, file.name, () => {}, audioSource);
    // const cleanFileName1 = getCleanFileName(file.name);
    // const res = await downloadFileBlob(downloadLink1, file.name, () => {}, audioSource);
    // const startBlobDownload = res.startDownload;
    // const stopBlobDownload = res.stopDownload;
    // const returnval = await startBlobDownload();
    // console.log("returnval", returnval);
    // try {
    //   // Add new Track to store
    //   await trackActions.addNewTrack({
    //     fileURI: cleanFileName1,
    //     filename: file.name,
    //     sourceLocation: file.path_lower,
    //     playlistId: playlistId,
    //     pathIn,
    //     currFolderText,
    //     audioSource,
    //   });
    // } catch (e) {
    //   console.log(`Error trackActions.addNewTrack for ${cleanFileName1} `, e);
    // }
    // return;
    //! NEW
    const downloadItem: DownloadQueueItem = {
      fileId: file.id,
      fileName: file.name,
      filePathLower: file.path_lower,
      pathIn,
      currFolderText,
      playlistId: playlistId,
      audioSource,
      calculateColor: true,
    };
    qActions.addToQueue(downloadItem);
    return;
  };

  return (
    <View
      key={file.id}
      // className="px-3 py-2 flex-row justify-between items-center  overflow-hidden "
      style={{
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.amber700,
        paddingHorizontal: 8,
        paddingVertical: 5,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* <FileAudioIcon /> */}
      {/* <View className="border border-blue-800 overflow-hidden"> */}

      <Text
        className={`font-ssp_regular text-base overflow-hidden flex-1 text-amber-950`}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {file.name}
      </Text>
      <View className="flex-row justify-end items-center flex-shrink-0">
        <Text className="ml-3 font-ssp_regular text-base text-amber-950 mr-1">
          {formatBytes(file.size)}
        </Text>
        {isDownloaded && (
          <AsteriskIcon color="green" size={20} style={{ marginLeft: 2, marginRight: 2 }} />
        )}
        {!isDownloading && !isDownloaded && !isAdding && (
          <Pressable onPress={async () => await downloadFile(file)} disabled={isDownloaded}>
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

      {/* {isDownloading && isGoogle && (
        <View
          style={{
            position: "absolute",
            bottom: 5,
            left: 8,
            backgroundColor: "white",
            borderRadius: 10,
          }}
        >
          <Progress.Bar indeterminate />
        </View>
      )} */}
    </View>
  );
};

export default React.memo(ExplorerFile);
