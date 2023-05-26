import { View, Text, Pressable, StyleSheet } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { FileEntry, getDropboxFileLink } from "../../utils/dropboxUtils";
import {
  AsteriskIcon,
  CloseIcon,
  CloudDownloadIcon,
  FileAudioIcon,
} from "../common/svg/Icons";
import { formatBytes } from "../../utils/formatUtils";
import { DownloadPauseState } from "expo-file-system";
import { Lato_700Bold } from "@expo-google-fonts/lato";
import { colors } from "../../constants/Colors";

import {
  DownloadProgress,
  downloadWithProgress,
} from "../../store/data/fileSystemAccess";
import { useTrackActions } from "../../store/store";
import * as Progress from "react-native-progress";

type Props = {
  file: FileEntry;
  playlistId?: string;
};
const ExplorerFile = ({ file, playlistId }: Props) => {
  const trackActions = useTrackActions();
  const [progress, setProgress] = useState<DownloadProgress>();

  const [isDownloading, setIsDownloading] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(file.alreadyDownload);

  const stopDownloadRef = useRef<() => Promise<DownloadPauseState>>();

  useEffect(() => {
    if (playlistId) {
      if (!isDownloaded) {
        downloadFile(file);
      }
    }
  }, [playlistId]);
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

    const downloadLink = await getDropboxFileLink(file.path_lower);
    const { startDownload, pauseDownload } = await downloadWithProgress(
      downloadLink,
      file.name,
      setProgress
    );
    stopDownloadRef.current = pauseDownload;
    const { fileURI } = await startDownload();

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
    trackActions.addNewTrack(fileURI, file.name, file.path_lower, playlistId);
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
          <AsteriskIcon
            color="green"
            size={20}
            style={{ marginLeft: 2, marginRight: 2 }}
          />
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
      {isDownloading && (
        <View
          style={{
            position: "absolute",
            // marginHorizontal: 20,
            // marginVertical: 5,
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

export default ExplorerFile;
