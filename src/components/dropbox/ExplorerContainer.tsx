import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Dimensions,
  FlatList,
  RefreshControl,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import uuid from "react-native-uuid";
import { Link } from "expo-router";
import { listDropboxFiles, DropboxDir } from "../../utils/dropboxUtils";
import ExplorerActionBar from "./ExplorerActionBar";
// import { useTrackActions } from "../../store/store";
import ExplorerFile from "./ExplorerFile";
import ExplorerFolder from "./ExplorerFolder";
import { useTrackActions } from "../../store/store";
import { MotiView } from "moti";
import { times } from "lodash";
import { Skeleton } from "moti/skeleton";
import { FolderClosedIcon } from "../common/svg/Icons";
import {
  downloadFolderMetadata,
  useDropboxStore,
} from "../../store/store-dropbox";
import FileMetadataView from "./FileMetadataView";
import ExplorerFolderRow from "./ExplorerFolderRow";

function filterAudioFiles(filesAndFolders: DropboxDir) {
  const files = filesAndFolders.files;
  const AUDIO_FORMATS = [
    "mp3",
    "mb4",
    "m4a",
    "m4b",
    "wav",
    "aiff",
    "aac",
    "ogg",
    "wma",
    "flac",
  ];
  const newFiles = files.filter((file) =>
    AUDIO_FORMATS.includes(file.name.slice(file.name.lastIndexOf(".") + 1))
  );
  return { folders: filesAndFolders.folders, files: newFiles };
}

const { height, width } = Dimensions.get("screen");
type Props = {
  pathIn: string;
  onPathChange: (newPath: string, folderName: string) => void;
};
const ExplorerContainer = ({ pathIn, onPathChange }: Props) => {
  const [filesFolderObj, setFilesFolderObj] = React.useState<DropboxDir>();
  const [flatlistData, setFlatlistData] = React.useState([]);
  const [downloadAllId, setDownloadAllId] = React.useState<string>();
  const [downloadMetadata, setDownloadMetadata] = React.useState(false);

  const [showMetadata, setShowMetadata] = React.useState<
    "off" | "on" | "loading"
  >("off");
  const allFoldersMetadata = useDropboxStore((state) => state.folderMetadata);
  // console.log("ALL FOLDERS", Object.keys(allFoldersMetadata || {}));

  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(undefined);
  const trackActions = useTrackActions();
  const dropboxActions = useDropboxStore((state) => state.actions);

  const renderItem = useCallback(
    ({ item, index }) => {
      if (item[".tag"] === "folder") {
        return (
          <ExplorerFolder
            key={item.id}
            index={index}
            folder={item}
            onNavigateForward={onNavigateForward}
            showFolderMetadata={showMetadata}
            folderMetadata={allFoldersMetadata?.[item.path_lower]}
          />
        );
      } else if (item[".tag"] === "file") {
        return (
          <ExplorerFile key={item.id} file={item} playlistId={downloadAllId} />
        );
      }
    },
    [showMetadata, downloadAllId, allFoldersMetadata]
  );

  React.useEffect(() => {
    const getFiles = async () => {
      setIsLoading(true);
      setDownloadAllId(undefined);
      try {
        const files = await listDropboxFiles(pathIn);
        // console.log("FILES", files);
        const filteredFoldersFiles = filterAudioFiles(files);
        const taggedFiles = trackActions.isTrackDownloaded(
          filteredFoldersFiles.files
        );
        const taggedFolders = dropboxActions.isFolderFavorited(
          filteredFoldersFiles.folders
        );

        const finalFolderFileList: DropboxDir = {
          folders: taggedFolders, //filteredFoldersFiles.folders,
          files: taggedFiles,
        };
        setFilesFolderObj(finalFolderFileList);
        setFlatlistData([
          ...finalFolderFileList.folders,
          ...finalFolderFileList.files,
        ]);
        // setIsError(undefined)
      } catch (err) {
        console.log(err);
        setIsError("Dropbox");
      }
      setIsLoading(false);
    };
    getFiles();
  }, [pathIn]);

  //~ ====================
  //~ == Navigate forward in Dropbox ==
  //~ ====================
  const onNavigateForward = (nextPath: string, folderName: string) => {
    onPathChange(nextPath, folderName);
  };
  //~ ====================
  //~ == download Folder Metadata flag set==
  //~ ====================
  const onDownloadMetadata = async () => {
    // If we are showing metadata, then hide and return
    if (showMetadata !== "off") {
      setShowMetadata("off");
      return;
    }
    // Call download function and set to show metadata
    setShowMetadata("loading");
    await downloadFolderMetadata(filesFolderObj.folders);
    // console.log("turn on show meta flag");
    setShowMetadata("on");
  };
  //~ ====================
  //~ onDownloadAll
  //~ ====================
  const onDownloadAll = () => {
    // path WILL equal currentPath and we can just assume
    // the current "files" state variable has the data we need
    // When this function is called, we will set a download state
    // variable, and upon rerender, pass that to each file, which will trigger
    // it to download.
    const playlistId = uuid.v4() as string;
    setDownloadAllId(playlistId);
  };
  //~ == ERROR JSX ===
  if (isError) {
    return (
      <View className="flex-1 flex-col items-center mt-5">
        <Text className="text-lg">Error: {isError}</Text>
        {isError === "Dropbox" && (
          <View className="flex-row justify-center mt-2">
            <Link href="/settings/dropboxauth">
              <View
                className="p-2 border border-amber-800 bg-blue-600 flex justify-center items-center"
                style={{ borderRadius: 10 }}
              >
                <Text className="text-white text-lg">Authorize Dropbox</Text>
              </View>
            </Link>
          </View>
        )}
      </View>
    );
  }
  //~ == LOADING JSX ===
  if (isLoading) {
    return (
      <MotiView
        className="flex-1 justify-center items-center"
        from={{ rotateY: "0deg" }}
        animate={{ rotateY: "360deg" }}
        transition={{
          type: "timing",
          duration: 1000,
          loop: true,
        }}
      >
        <FolderClosedIcon size={45} />
      </MotiView>
    );
  }
  //~ == FINAL JSX ===
  return (
    <MotiView
      from={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.5 }}
      style={{ flex: 1, flexDirection: "column", justifyContent: "flex-start" }}
    >
      <View style={{ zIndex: 5 }}>
        <ExplorerActionBar
          currentPath={pathIn}
          fileCount={filesFolderObj?.files?.length || 0}
          folderCount={filesFolderObj?.folders?.length || 0}
          handleDownloadAll={onDownloadAll}
          handleDownloadMetadata={onDownloadMetadata}
        />
      </View>

      {filesFolderObj?.files?.length > 0 && (
        <FileMetadataView metadata={allFoldersMetadata?.[pathIn]} />
      )}

      <FlatList
        data={flatlistData}
        // refreshControl={
        //   <RefreshControl refreshing={false} onRefresh={onRefresh} />
        // }
        extraData={allFoldersMetadata}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal={false}
        maxToRenderPerBatch={10}
      />
    </MotiView>
  );
};

export default ExplorerContainer;

function goBackInPath(path: string, delimiter: string = "/") {
  const lastSlash = path.lastIndexOf(delimiter);
  if (lastSlash < 0) {
    return "";
  }
  return path.slice(0, lastSlash);
}
