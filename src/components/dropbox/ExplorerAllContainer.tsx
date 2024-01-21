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
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import uuid from "react-native-uuid";
import { Link, router, useLocalSearchParams, useRouter } from "expo-router";
import { DropboxDir, FileEntry, FolderEntry } from "../../utils/dropboxUtils";
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
  checkForFolderMetadata,
  downloadFolderMetadata,
  extractMetadataKeys,
  folderFileReader,
  recurseFolderMetadata,
  sanitizeString,
  tagFilesAndFolders,
  useDropboxStore,
} from "../../store/store-dropbox";
import FileMetadataView from "./FileMetadataView";
import { AudioSourceType } from "@app/audio/dropbox";
import { listGoogleDriveFiles } from "@utils/googleUtils";
import { useSettingStore } from "@store/store-settings";

import { checkForFolderMetadataGoogle } from "@utils/commonCloudUtils";
// import { startDownloadAll } from "@store/data/fileSystemAccess";

type Props = {
  pathIn: string;
  audioSource: AudioSourceType;
  onPathChange: (newPath: string, folderName: string) => void;
  yOffset?: number;
};

const ExplorerContainer = ({ pathIn, audioSource, onPathChange, yOffset = undefined }: Props) => {
  const [filesFolderObj, setFilesFolderObj] = React.useState<DropboxDir>();
  const [flatlistData, setFlatlistData] = React.useState<(FileEntry | FolderEntry)[]>([]);
  const [downloadAllId, setDownloadAllId] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(undefined);

  const [displayMetadata, toggeleDisplayMetadata] = React.useReducer((prev) => !prev, false);
  const allFoldersMetadata = useDropboxStore((state) => state.folderMetadata || {});
  const { pathToFolderKey, pathToBookFolderKey } =
    audioSource === "dropbox"
      ? extractMetadataKeys(pathIn)
      : { pathToFolderKey: pathIn, pathToBookFolderKey: "" };

  const metaCheckKey =
    audioSource === "dropbox" ? `${pathToFolderKey}_${pathToBookFolderKey}` : pathToFolderKey;

  const hasMetadata = !!Object.keys(allFoldersMetadata).find(
    (key) => key === `${metaCheckKey}`
    // (key) => key === `${pathToFolderKey}_${pathToBookFolderKey}`
  );

  const { backTitle } = useLocalSearchParams();
  const cloudAuth = useSettingStore((state) => state.cloudAuth);
  const route = useRouter();

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
    if (flatlistRef.current && !isLoading && yOffset) {
      flatlistRef.current.scrollToOffset({
        offset: Math.floor(yOffset),
      });
    }
  }, [flatlistRef.current, isLoading]);
  // ------------------------------------------------------------------------

  const renderItem = useCallback(
    ({ item, index }) => {
      // console.log("ITEM", item, index);
      if (!item.path_lower) return;
      // console.log("ITEM", item.path_lower);
      if (item[".tag"] === "folder") {
        // const { pathToFolderKey, pathToBookFolderKey } = extractMetadataKeys(item.path_lower);
        const { pathToFolderKey, pathToBookFolderKey } =
          audioSource === "dropbox"
            ? extractMetadataKeys(item.path_lower)
            : {
                pathToFolderKey: item.path_display,
                pathToBookFolderKey: sanitizeString(item.name).toLowerCase(),
              };
        // console.log("pathtobookRENDER", pathToFolderKey, pathToBookFolderKey);
        // console.log("METADATA", allFoldersMetadata?.[pathToFolderKey]?.[pathToBookFolderKey]);
        return (
          <ExplorerFolder
            key={item.id}
            index={index}
            folder={item}
            onNavigateForward={onNavigateForward}
            displayFolderMetadata={displayMetadata}
            onDownloadMetadata={onDownloadMetadata}
            // setShowMetadata={setShowMetadata}
            folderMetadata={allFoldersMetadata?.[pathToFolderKey]?.[pathToBookFolderKey]}
            hasMetadata={hasMetadata}
            audioSource={audioSource}
          />
        );
      } else if (item[".tag"] === "file") {
        return (
          <ExplorerFile
            key={item.id}
            file={item}
            playlistId={downloadAllId}
            pathIn={pathIn}
            audioSource={audioSource}
          />
        );
      }
    },
    [displayMetadata, downloadAllId, allFoldersMetadata, hasMetadata, pathIn, audioSource]
  );

  //~ ====================
  //~ -- Whenever pathIn changes, load the folders and files to display
  //~ ====================
  React.useEffect(() => {
    // check if we are authorized for passed source
    if (cloudAuth?.[audioSource] === false) {
      route.replace("/settings/authroute");
      return;
    }
    // Google Files
    const getFiles = async () => {
      setIsLoading(true);
      if (audioSource === "google") {
        const filesFolders = await listGoogleDriveFiles(pathIn);

        // tag tracks as being already downloaded and marked as a Starred folder
        await checkForFolderMetadataGoogle(filesFolders.folders, filesFolders?.metaAggr);
        // await checkForFolderMetadataGoogle(filesFolders.folders, filesFolders?.metaAggr);
        const finalFolderFileList = tagFilesAndFolders({
          folders: filesFolders.folders,
          files: filesFolders.files,
        });
        setFilesFolderObj(finalFolderFileList);
        setFlatlistData([...finalFolderFileList.folders, ...finalFolderFileList.files]);
      } else if (audioSource === "dropbox") {
        await getFilesFromDropbox();
      }
      setIsLoading(false);
    };
    const getFilesFromDropbox = async () => {
      try {
        // Read next list of folders and files
        // console.log("Reading folder", pathIn);
        const finalFolderFileList = await folderFileReader(pathIn);
        setFilesFolderObj(finalFolderFileList);
        setFlatlistData([...finalFolderFileList.folders, ...finalFolderFileList.files]);
        // setIsError(undefined)
      } catch (err) {
        // If we don't get data back from dropbox we will alert user and redirect to main audio sources route.
        // Unless it is an invalid token, then we send to authorize dropbox page.
        // console.log(err.message);
        if (err.message.includes("Invalid Token")) {
          router.replace("/settings/authroute");
        } else {
          Alert.alert(
            `Error finding path ${pathIn}.  Error in Link or you are not authorized for that dropbox account.`
          );
          router.back();
        }
      }
    };

    setDownloadAllId(undefined);
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
  const onDownloadMetadata = async (startingFolder: FolderEntry[] = undefined) => {
    // If we are showing metadata, then hide and return
    // console.log("IN onDowloadMetadata", startingFolder);
    // if (showMetadata !== "off") {
    //   setShowMetadata("off");
    //   return;
    // }
    // // console.log("Y", filesFolderObj.folders);
    // // Call download function and set to show metadata
    // setShowMetadata("loading");
    // pathIn will be the full path to the current folder
    // So filesFolderObj.folders will be ALL the folders IN the pathIn path.
    // One of the keys of the folders object is the ".path_lower" property
    // and it has the full path including the folder name so we can look from the
    // ...metdata.json file in each folder
    // await downloadFolderMetadata(filesFolderObj.folders);
    const foldersToRecurse = startingFolder ? startingFolder : filesFolderObj.folders;
    // console.log(foldersToRecurse.map((el) => el.path_display));
    await recurseFolderMetadata(foldersToRecurse);
    // AFter getting metadata, tell renderItem to show metadata info.
    // setShowMetadata("on");
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
            <Link href="/settings/authroute">
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
          // currentPath={pathIn}
          audioSource={audioSource}
          fileCount={filesFolderObj?.files?.length || 0}
          folderCount={filesFolderObj?.folders?.length || 0}
          // showMetadata={showMetadata}
          displayMetadata={displayMetadata}
          hasMetadata={hasMetadata}
          handleDownloadAll={onDownloadAll}
          handleDownloadMetadata={onDownloadMetadata}
          handleDisplayMetadata={toggeleDisplayMetadata}
        />
      </View>

      {filesFolderObj?.files?.length > 0 && (
        <>
          <FileMetadataView
            metadata={allFoldersMetadata?.[pathToFolderKey]?.[pathToBookFolderKey]}
            path_lower={pathIn}
            folderName={backTitle}
            audioSource={audioSource}
          />
        </>
      )}

      <FlatList
        data={flatlistData}
        // refreshControl={
        //   <RefreshControl refreshing={false} onRefresh={onRefresh} />
        // }
        ref={flatlistRef}
        extraData={[allFoldersMetadata, displayMetadata, hasMetadata]}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal={false}
        maxToRenderPerBatch={30}
        windowSize={30}
        // scrollEventThrottle={16}
        onScroll={handleScroll}
        //! Need to update the length based on if it is open or not
        getItemLayout={(data, index) => {
          let offset = hasMetadata && displayMetadata ? 210 : 45;
          // let offset = showMetadata === "off" ? 45 : 210;
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
