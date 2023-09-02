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
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import uuid from "react-native-uuid";
import { Link } from "expo-router";
import {
  listDropboxFiles,
  DropboxDir,
  FileEntry,
  FolderEntry,
} from "../../utils/dropboxUtils";
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
  createFolderMetadataKey,
  downloadFolderMetadata,
  useDropboxStore,
} from "../../store/store-dropbox";
import FileMetadataView from "./FileMetadataView";
import ExplorerFolderRow from "./ExplorerFolderRow";
import { startDownloadAll } from "@store/data/fileSystemAccess";

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
  yOffset?: number;
};
const ExplorerContainer = ({ pathIn, onPathChange, yOffset = 0 }: Props) => {
  const [filesFolderObj, setFilesFolderObj] = React.useState<DropboxDir>();
  const [flatlistData, setFlatlistData] = React.useState<
    FileEntry[] | FolderEntry[]
  >([]);
  const [downloadAllId, setDownloadAllId] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(undefined);

  const [showMetadata, setShowMetadata] = React.useState<
    "off" | "on" | "loading"
  >("off");
  const allFoldersMetadata = useDropboxStore((state) => state.folderMetadata);

  const trackActions = useTrackActions();
  const dropboxActions = useDropboxStore((state) => state.actions);

  const flatlistRef = useRef<FlatList>();

  // ------------------------------------------------------------------------
  // -- HANDLE SCROLL and Save to Dropbox Store's FolderNavigation array
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;
    dropboxActions.updateFolderNavOffset(contentOffsetY);
  };

  // SCROLL TO OFFSET
  // Need to wait until loading is finished before flatlistRef will
  // be available.  Then we can scroll
  useEffect(() => {
    if (flatlistRef.current && !isLoading) {
      flatlistRef.current.scrollToOffset({
        offset: Math.floor(yOffset),
      });
    }
  }, [flatlistRef.current, isLoading]);
  // ------------------------------------------------------------------------

  const renderItem = useCallback(
    ({ item, index }) => {
      if (item[".tag"] === "folder") {
        const metadataKey = createFolderMetadataKey(item.path_lower);
        return (
          <ExplorerFolder
            key={item.id}
            index={index}
            folder={item}
            onNavigateForward={onNavigateForward}
            showFolderMetadata={showMetadata}
            setShowMetadata={setShowMetadata}
            folderMetadata={allFoldersMetadata?.[metadataKey]}
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
    // console.log("PATH IN", pathIn);
    // pathIn will be the full path to the current folder
    // So filesFolderObj.folders will be the folders IN the pathIn path.
    // BUT the folders object being sent has the .path_lower property on it
    // and it has the full path including the folder name
    await downloadFolderMetadata(filesFolderObj.folders);
    // console.log("turn on show meta flag");
    setShowMetadata("on");
  };
  //! ~ ====================
  //! ~ onDownloadAll
  //! ~ ====================
  const onDownloadAll = async () => {
    //-- This was an expirment to download outside of components and then
    //-- update component as things finished.
    //-- useEffect used when "setFilesDone" updated which updated the
    //-- flatlistData so the file.isAlreadyDownloaded was set to true
    //-- Next step would have been to pass on the progress
    // const files = flatlistData.filter((el) => el[".tag"] === "file");
    // await startDownloadAll(files, setFilesDone, setProgress);
    // return;
    //--
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
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
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
        <>
          <FileMetadataView
            metadata={allFoldersMetadata?.[createFolderMetadataKey(pathIn)]}
            path_lower={pathIn}
          />
        </>
      )}

      <FlatList
        data={flatlistData}
        // refreshControl={
        //   <RefreshControl refreshing={false} onRefresh={onRefresh} />
        // }
        ref={flatlistRef}
        extraData={[allFoldersMetadata, showMetadata]}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal={false}
        maxToRenderPerBatch={10}
        windowSize={10}
        // scrollEventThrottle={16}
        onScroll={handleScroll}
        //! Need to update the length based on if it is open or not
        getItemLayout={(data, index) => {
          let offset = showMetadata === "off" ? 45 : 200;
          if (filesFolderObj?.files?.length > 0) {
            offset = 45;
          }
          return { length: offset, offset: offset * index, index };
        }}
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
