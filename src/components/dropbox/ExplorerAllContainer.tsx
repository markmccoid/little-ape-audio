import { View, Text, FlatList, NativeSyntheticEvent, NativeScrollEvent, Alert } from "react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import uuid from "react-native-uuid";
import { Link, router, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { DropboxDir, FileEntry, FolderEntry } from "../../utils/dropboxUtils";
import ExplorerActionBar from "./ExplorerActionBar";
// import { useTrackActions } from "../../store/store";
import ExplorerFile from "./ExplorerFile";
import ExplorerFolder from "./ExplorerFolder";
import { MotiView } from "moti";
import { FolderClosedIcon } from "../common/svg/Icons";
import {
  extractMetadataKeys,
  folderFileReader,
  recurseFolderMetadata,
  tagFilesAndFolders,
  useDropboxStore,
} from "../../store/store-dropbox";
import FileMetadataView from "./FileMetadataView";
import { AudioSourceType } from "@app/audio/dropbox";
import { listGoogleDriveFiles } from "@utils/googleUtils";
import { useSettingStore } from "@store/store-settings";

import { checkForFolderMetadataGoogle } from "@utils/commonCloudUtils";
import { sanitizeString } from "@utils/otherUtils";
import { useDownloadQStore, DownloadQueueItem } from "@store/store-downloadq";

type Props = {
  pathIn: string;
  // This will be the current folder Text.  USEFUL for google to know the actual text instead of ID of folder
  currFolderText: string;
  audioSource: AudioSourceType;
  onPathChange: (newPath: string, folderName: string) => void;
  yOffset?: number;
  parentFolderId?: string;
};

const ExplorerAllContainer = ({
  pathIn,
  currFolderText,
  audioSource,
  onPathChange,
  yOffset = undefined,
  parentFolderId,
}: Props) => {
  const [filesFolderObj, setFilesFolderObj] = React.useState<DropboxDir>();
  const [flatlistData, setFlatlistData] = React.useState<(FileEntry | FolderEntry)[]>([]);
  const [downloadAllId, setDownloadAllId] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(undefined);
  const [displayMetadata, toggeleDisplayMetadata] = React.useReducer((prev) => !prev, false);
  const allFoldersMetadata = useDropboxStore((state) => state.folderMetadata || {});

  const qActions = useDownloadQStore((state) => state.actions);
  // const qActions = useDownloadQStore((state) => state.actions);
  const folderNavigation = useDropboxStore((state) => state.folderNavigation);

  // pathIn for dropbox will be "/some/dirs" and we can use extractMetadataKeys() to get the pathToFolderKey and pathToBookFolderKey to metadata
  // with Google, the pathIn will be a folderId.
  const { pathToFolderKey, pathToBookFolderKey } =
    audioSource === "dropbox"
      ? extractMetadataKeys(pathIn)
      : { pathToFolderKey: pathIn, pathToBookFolderKey: sanitizeString(pathIn) };

  const metaCheckKey =
    audioSource === "dropbox"
      ? `${pathToFolderKey ? pathToFolderKey + "_" : ""}${pathToBookFolderKey}`
      : pathToFolderKey;

  const hasMetadata = !!Object.keys(allFoldersMetadata).find(
    (key) => key === `${metaCheckKey}`
    // (key) => key === `${pathToFolderKey}_${pathToBookFolderKey}`
  );

  const { backTitle } = useLocalSearchParams();
  const cloudAuth = useSettingStore((state) => state.cloudAuth);
  const route = useRouter();

  const dropboxActions = useDropboxStore((state) => state.actions);
  const flatlistRef = useRef<FlatList>();

  //!

  // ------------------------------------------------------------------------
  // -- HANDLE SCROLL and Save to Dropbox Store's FolderNavigation array
  // const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
  //   const contentOffsetY = event.nativeEvent.contentOffset.y;
  //   dropboxActions.updateFolderNavOffset(contentOffsetY);
  // };

  // SCROLL TO OFFSET
  // Need to wait until loading is finished before flatlistRef will
  // be available.  Then we can scroll
  // useEffect(() => {
  //   if (flatlistRef.current && !isLoading && yOffset) {
  //     flatlistRef.current.scrollToOffset({
  //       offset: Math.floor(yOffset),
  //     });
  //   }
  // }, [flatlistRef.current, isLoading]);
  // ------------------------------------------------------------------------

  const renderItem = useCallback(
    ({ item, index }) => {
      // console.log("ITEM", item, index);
      if (!item.path_lower) return;
      // console.log(
      //   "ITEM",
      //   folderNavigation[folderNavigation.length - 2]?.fullPath,
      //   item.path_display
      // );
      if (item[".tag"] === "folder") {
        // const { pathToFolderKey, pathToBookFolderKey } = extractMetadataKeys(item.path_lower);
        const { pathToFolderKey, pathToBookFolderKey } =
          audioSource === "dropbox"
            ? extractMetadataKeys(item.path_lower)
            : {
                // For Google path_display = Parent Folder ID
                pathToFolderKey: item.path_display,
                // item.id = folder id (path_lower also is folder id)
                pathToBookFolderKey: item.id,
              };
        // console.log("METADATA", allFoldersMetadata?.[pathToFolderKey]?.[pathToBookFolderKey]);
        return (
          <ExplorerFolder
            key={item.id}
            index={index}
            folder={item}
            onNavigateForward={onNavigateForward}
            displayFolderMetadata={displayMetadata}
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
            currFolderText={currFolderText}
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

        // console.log("FILESFOLDERS", filesFolders);
        // tag tracks as being already downloaded and marked as a Starred folder
        setTimeout(
          async () =>
            await checkForFolderMetadataGoogle(filesFolders.folders, filesFolders?.metaAggr),
          10
        );
        // await checkForFolderMetadataGoogle(filesFolders.folders, filesFolders?.metaAggr);
        const finalFolderFileList = tagFilesAndFolders({
          folders: filesFolders.folders,
          files: filesFolders.files,
        });

        setFilesFolderObj(finalFolderFileList);
        setFlatlistData([...finalFolderFileList.folders, ...finalFolderFileList.files]);
        /** DROPBOX ROUTE */
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

  //~ ===========================
  //~ IMPORTANT Effect - This keeps the list of files and folders tagged properly
  //~ When we navigate back to a screen, we don't trigger the useEffect above that runs getFiles()
  //~ This is fine in the sense that the state is cached and we have our files, BUT we don't have the
  //~ updated isDownloaded tag for files.  We must update it.
  //~ Notice, when we go unfocused, we are clearing our completed queue.  The completed queue is only needed for items
  //~ downloaded while on the screen.
  //~ ===========================
  useFocusEffect(
    React.useCallback(() => {
      // Code to be executed when the screen comes into focus
      setFilesFolderObj((prev) => {
        if (prev?.files.length > 0) {
          const finalFolderFileList = tagFilesAndFolders({
            folders: prev.folders,
            files: prev.files,
          });
          setFlatlistData([...finalFolderFileList.folders, ...finalFolderFileList.files]);
          return finalFolderFileList;
        }
      });

      return () => {
        // Cleanup code to be executed when the screen goes out of focus
        qActions.clearCompletedDownloads();
      };
    }, [])
  );

  //~ ====================
  //~ == Navigate forward in Dropbox ==
  //~ ====================
  const onNavigateForward = (nextPath: string, folderName: string) => {
    onPathChange(nextPath, folderName);
  };

  //! ~ ====================
  //! ~ onDownloadAll
  //! ~ ====================
  const onDownloadAll = async () => {
    //-- Get a list of all files in the current folder that have not been downloaded
    const files = flatlistData.filter((el) => el[".tag"] === "file" && !el.alreadyDownload);
    //-- Create a playlist ID
    const playlistId = uuid.v4() as string;
    //-- Add the files to the download queue
    let i = 0;
    for (let file of files) {
      const downloadItem: DownloadQueueItem = {
        fileId: file.id,
        fileName: file.name,
        filePathLower: file.path_lower,
        audioSource: audioSource,
        pathIn,
        currFolderText,
        playlistId: playlistId,
        calculateColor: i === 0 ? true : false,
      };
      i++;
      qActions.addToQueue(downloadItem);
    }

    //-- OLD WAY -- downloading was in the ExplorerFile - hard to control # of downloads, etc
    // path WILL equal currentPath and we can just assume
    // the current "files" state variable has the data we need
    // When this function is called, we will set a download state
    // variable, and upon rerender, pass that to each file, which will trigger
    // it to download.

    // const playlistId = uuid.v4() as string;
    // setDownloadAllId(playlistId);
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
          filesDownloaded={
            flatlistData.filter((el) => el[".tag"] === "file" && el.alreadyDownload).length
          }
          folderPath={pathIn}
          // showMetadata={showMetadata}
          displayMetadata={displayMetadata}
          hasMetadata={hasMetadata}
          handleDownloadAll={onDownloadAll}
          handleDisplayMetadata={toggeleDisplayMetadata}
        />
      </View>

      {filesFolderObj?.files?.length > 0 && (
        <>
          <FileMetadataView
            metadata={
              audioSource === "dropbox"
                ? allFoldersMetadata?.[pathToFolderKey]?.[pathToBookFolderKey]
                : allFoldersMetadata?.[parentFolderId]?.[pathIn]
              // : allFoldersMetadata?.[folderNavigation[folderNavigation.length - 2]?.fullPath]?.[pathIn]
            }
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
        // onScroll={handleScroll}
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

export default React.memo(ExplorerAllContainer);

function goBackInPath(path: string, delimiter: string = "/") {
  const lastSlash = path.lastIndexOf(delimiter);
  if (lastSlash < 0) {
    return "";
  }
  return path.slice(0, lastSlash);
}
