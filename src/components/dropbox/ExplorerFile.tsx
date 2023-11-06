import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { FileEntry, getDropboxFileLink } from "../../utils/dropboxUtils";
import { AsteriskIcon, CloseIcon, CloudDownloadIcon, FileAudioIcon } from "../common/svg/Icons";
import { formatBytes } from "../../utils/formatUtils";
import { DownloadPauseState } from "expo-file-system";
import { Lato_700Bold } from "@expo-google-fonts/lato";
import { colors } from "../../constants/Colors";

import {
  DownloadProgress,
  downloadWithProgress,
  getCleanFileName,
} from "../../store/data/fileSystemAccess";
import { useTrackActions } from "../../store/store";
import * as Progress from "react-native-progress";
import { AudioSourceType } from "@app/audio/dropbox";

import * as FileSystem from "expo-file-system";
import { downloadGoogleFile, getAccessToken } from "@utils/googleUtils";
import axios from "axios";

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
  const [progress, setProgress] = useState<DownloadProgress>();

  const [isDownloading, setIsDownloading] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(file.alreadyDownload);

  const stopDownloadRef = useRef<() => Promise<DownloadPauseState>>();

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
  //~ --- Download All Trigger -----
  const downloadAll = () => {};
  //~ --- stopDownload of file -----
  const stopDownload = async () => {
    setStopped(true);
    // this ref has a function that will cancel the download
    stopDownloadRef?.current && stopDownloadRef.current();
  };
  //~ --- downloadFile function to download file while setting progress state --------------
  const downloadFile = async (file: FileEntry) => {
    setIsDownloading(true);
    let downloadLink;
    // Get download link based on audioSource
    if (audioSource === "dropbox") {
      downloadLink = await getDropboxFileLink(file.path_lower);
    } else if (audioSource === "google") {
      //!! GOOGLE
      // console.log("GOOGLE DL->", file.id, file.name);
      const { cleanFileName } = await downloadGoogleFile(file.id, file.name);
      setIsDownloaded(true);
      setIsDownloading(false);
      // Add new Track to store
      //!  NEED to clean filename and not send WHOLE Uri just filename
      //! how is sourceLocation used if at all
      trackActions.addNewTrack({
        fileURI: cleanFileName,
        filename: file.name,
        sourceLocation: file.path_lower,
        playlistId: playlistId,
        pathIn,
        audioSource,
      });
      // const accessToken = await getAccessToken();
      // console.log(accessToken);
      // downloadLink = `${file?.webContentLink}`;
      return;
    }
    const { startDownload, pauseDownload } = downloadWithProgress(
      downloadLink,
      file.name,
      setProgress
    );
    stopDownloadRef.current = pauseDownload;
    const { fileURI, cleanFileName } = await startDownload();

    // RESET Progress and other clean up
    setProgress({ downloadProgress: 0, bytesExpected: 0, bytesWritten: 0 });
    setIsDownloading(false);
    stopDownloadRef.current = undefined;

    // Bail if stopped OR no fileURI, assumption is download was cancelled
    if (stopped || !fileURI) {
      setStopped(false);
      return;
    }
    setIsDownloaded(true);
    // Add new Track to store
    trackActions.addNewTrack({
      fileURI: cleanFileName,
      filename: file.name,
      sourceLocation: file.path_lower,
      playlistId: playlistId,
      pathIn,
      audioSource,
    });
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
          <Pressable onPress={() => downloadFile(file)} disabled={isDownloaded}>
            <CloudDownloadIcon />
          </Pressable>
        )}
        {isDownloading && (
          <Pressable onPress={stopDownload}>
            <CloseIcon />
          </Pressable>
        )}
      </View>
      {isDownloading && isDropbox && (
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
      {/* Google Progress Indicator */}
      {isDownloading && isGoogle && (
        <View
          style={{
            position: "absolute",
            bottom: 5,
            left: 8,
            backgroundColor: "white",
            borderRadius: 10,
          }}
        >
          <ActivityIndicator size="small" color="red" />
        </View>
      )}
    </View>
  );
};

export default React.memo(ExplorerFile);
