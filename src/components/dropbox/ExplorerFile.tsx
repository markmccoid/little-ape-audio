import { View, Text, Pressable, StyleSheet } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { FileEntry, getDropboxFileLink } from "../../utils/dropboxUtils";
import { AsteriskIcon, CloseIcon, CloudDownloadIcon } from "../common/svg/Icons";
import { formatBytes } from "../../utils/formatUtils";
import { colors } from "../../constants/Colors";
import { DownloadProgress, downloadFileWProgress } from "../../store/data/fileSystemAccess";
import { usePlaybackStore, useTrackActions } from "../../store/store";
import * as Progress from "react-native-progress";
import { AudioSourceType } from "@app/audio/dropbox";
import { DownloadProgressCallbackResult } from "react-native-fs";

type Props = {
  file: FileEntry;
  audioSource: AudioSourceType;
  // This will be the path or folderId (google) of the folder the file resides in
  // Google will need this to AddTrack can look for metadata files.
  pathIn: string;
  playlistId?: string;
};
const ExplorerFile = ({ file, playlistId, audioSource, pathIn }: Props) => {
  const isDropbox = !!(audioSource === "dropbox");
  const isGoogle = !!(audioSource === "google");
  const trackActions = useTrackActions();
  const playlistLoaded = usePlaybackStore((state) => state.playlistLoaded);
  const resetPlaybackStore = usePlaybackStore((state) => state.actions.resetPlaybackStore);
  const [progress, setProgress] = useState<DownloadProgress>();

  const [isDownloading, setIsDownloading] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(file.alreadyDownload);

  const stopDownloadRef = useRef<() => void>();

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
    setStopped(true);
    // this ref has a function that will cancel the download
    stopDownloadRef?.current && stopDownloadRef.current();
  };
  //~ --- downloadFile function to download file while setting progress state --------------
  const downloadFile = async (file: FileEntry) => {
    setIsDownloading(true);
    // If playlist is loaded, reset store.  Needed because of how we pull chapter info
    // from the metadataChapterReceived event.
    if (playlistLoaded) {
      await resetPlaybackStore();
    }
    // Progress callback
    const onHandleProgress = (progressData: DownloadProgressCallbackResult) => {
      setProgress({
        downloadProgress: progressData.bytesWritten / progressData.contentLength,
        bytesExpected: progressData.contentLength,
        bytesWritten: progressData.bytesWritten,
      });
    };
    // based on if google or dropbox
    const downloadLink = isGoogle ? file.id : await getDropboxFileLink(file.path_lower);
    // Prepare to start the download
    const {
      cleanFileName,
      stopDownload: cancelDownload,
      startDownload,
    } = await downloadFileWProgress(downloadLink, file.name, onHandleProgress, audioSource);
    // Set the stop download function in a ref
    stopDownloadRef.current = cancelDownload;
    // Start the download
    try {
      const res = await startDownload();
    } catch (err) {
      console.log("ExplorerFile Download ERRROR");
      if (err.message.toLowerCase().includes("abort")) {
        setIsDownloaded(false);
        setIsDownloading(false);
        return;
      }
    }

    try {
      // Add new Track to store
      await trackActions.addNewTrack({
        fileURI: cleanFileName,
        filename: file.name,
        sourceLocation: file.path_lower,
        playlistId: playlistId,
        pathIn,
        audioSource,
      });
    } catch (e) {
      console.log(`Error trackActions.addNewTrack for ${cleanFileName} `, e);
    }
    // Reset Progress and download flags
    setProgress({ downloadProgress: 0, bytesExpected: 0, bytesWritten: 0 });
    setIsDownloaded(true);
    setIsDownloading(false);
    stopDownloadRef.current = undefined;
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
        {!isDownloading && !isDownloaded && (
          <Pressable onPress={async () => await downloadFile(file)} disabled={isDownloaded}>
            <CloudDownloadIcon />
          </Pressable>
        )}
        {isDownloading && (
          <Pressable onPress={stopDownload}>
            <CloseIcon />
          </Pressable>
        )}
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
