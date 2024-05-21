import { View, Text, StyleSheet, Dimensions, Pressable, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { Href, Link } from "expo-router";
import {
  DropboxIcon,
  FolderOpenIcon,
  GoogleDriveIcon,
  SearchIcon,
  StarFilledIcon,
} from "../../../components/common/svg/Icons";
import { colors } from "../../../constants/Colors";
// import MainFavFolders from "../../../components/dropbox/MainFavFoldersOLD";
import MainFavFolders from "@components/dropbox/MainFavFolders";
import ShowFavoritedBooks from "@components/dropbox/ShowFavoritedBooks";
import { AnimatedPressable } from "@components/common/buttons/Pressables";
import { AnimatePresence, MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { laabMetaAggrRecurseBegin, useDropboxStore } from "@store/store-dropbox";
import * as Network from "expo-network";
const { width, height } = Dimensions.get("window");
import useLocalFiles from "../../../hooks/useLocalFiles";
import * as Progress from "react-native-progress";
import useDownloadQStore from "@store/store-downloadq";

export type AudioSourceType = "dropbox" | "google" | "local" | "abs";
export type AudioSourceLinkParams = {
  newdir: string;
  fullPath: string;
  backTitle: string;
  yOffset?: string;
  audioSource?: AudioSourceType;
  parentFolderId: string;
};
const DropboxScreens = () => {
  const [currTab, setCurrTab] = useState<"folders" | "books">("folders");
  const insets = useSafeAreaInsets();
  const folderMetadata = useDropboxStore((state) => state.folderMetadata);
  const [networkActive, setNetworkActive] = useState(true);
  const [isLoading, selectLocalFiles] = useLocalFiles();
  const qActions = useDownloadQStore((state) => state.actions);
  // Check for network activity
  useEffect(() => {
    const checkForNetwork = async () => {
      const { isInternetReachable } = await Network.getNetworkStateAsync();
      setNetworkActive(isInternetReachable);
    };
    checkForNetwork();
    // When mounting clear the completed downloads
    // CANT do it on unmounting as items can download in the background
    qActions.clearCompletedDownloads();
  }, []);

  useEffect(() => {
    const autoCheckForMetadata = async () => {
      // Auto check and load the LAABMetaAggr....json files if enabled.
      if (useDropboxStore.getState().laabMetaAggrControls.enabled) {
        const metaAggrFolders = useDropboxStore.getState().laabMetaAggrControls.folders;
        for (const metaFolder of metaAggrFolders) {
          await laabMetaAggrRecurseBegin(metaFolder);
        }
      }
    };
    autoCheckForMetadata();
  }, []);
  return (
    <View
      className="flex-1 flex-col bg-amber-50"
      // style={{ bottom: insets.bottom }}
    >
      {/* DROPBOX LINK  */}
      <View className="mx-4 my-2">
        {!networkActive && (
          <View className="flex-row justify-center items-center border-yellow-500 border-2 rounded-xl p-1 mb-1 bg-red-100">
            <Text className="text-base font-semibold text-red-800">No Internet Detected</Text>
          </View>
        )}
        <Text className="text-amber-800 font-semibold mb-1 ml-2">Cloud</Text>
        <View
          className="rounded-xl bg-white"
          style={{
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.amber900,
          }}
        >
          {networkActive ? (
            <Link
              href={{
                pathname: "audio/dropbox/dropboxstart",
                params: {
                  fullPath: "",
                  backTitle: "Back",
                  audioSource: "dropbox",
                } as AudioSourceLinkParams,
              }}
            >
              <View className="flex-row px-2 py-3 items-center">
                <DropboxIcon color={colors.dropboxBlue} />
                <Text className="ml-3 text">Dropbox</Text>
              </View>
            </Link>
          ) : (
            <View className="flex-row px-2 py-3 items-center">
              <DropboxIcon color={"gray"} />
              <Text className="ml-3 text">Dropbox</Text>
            </View>
          )}
        </View>
        {/* GOOGLE -- */}
        <View
          className="rounded-xl bg-white mt-2"
          style={{
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.amber900,
          }}
        >
          {networkActive ? (
            <Link
              href={{
                pathname: "audio/dropbox/googlestart",
                params: {
                  fullPath: "",
                  backTitle: "Back",
                  audioSource: "google",
                } as AudioSourceLinkParams,
              }}
            >
              <View className="flex-row px-2 py-3 items-center">
                <GoogleDriveIcon color={colors.amber500} />
                <Text className="ml-3 text">Google Drive</Text>
              </View>
            </Link>
          ) : (
            <View className="flex-row px-2 py-3 items-center">
              <GoogleDriveIcon color={"gray"} />
              <Text className="ml-3 text">Google Drive</Text>
            </View>
          )}
        </View>
        {/* -- AudiobookShelf -- */}
        <View
          className="rounded-xl bg-white mt-2 flex-row items-center"
          style={{
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.amber900,
          }}
        >
          {networkActive ? (
            <Link
              href={{
                pathname: "audio/dropbox/audiobookshelf",
                params: {
                  fullPath: "",
                  backTitle: "Back",
                  audioSource: "abs",
                } as AudioSourceLinkParams,
              }}
              className="flex-1"
            >
              <View className="flex-row px-2 py-3 items-center">
                <Image
                  source={require("../../../../assets/absLogo.png")}
                  style={{ width: 28, height: 28 }}
                />
                <Text className="ml-3 text">AudiobookShelf</Text>
              </View>
            </Link>
          ) : (
            <View className="flex-row px-2 py-3 items-center">
              <Image
                source={require("../../../../assets/absLogo.png")}
                style={{ width: 28, height: 28 }}
              />
              <Text className="ml-3 text">AudiobookShelf</Text>
            </View>
          )}
        </View>
        {/* -- Local Files -- */}
        <View
          className="rounded-xl bg-white mt-2 flex-row items-center justify-between pr-4"
          style={{
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.amber900,
          }}
        >
          <Pressable onPress={selectLocalFiles} className="flex-1">
            <View className="flex-row px-2 py-3 items-center">
              <FolderOpenIcon color={colors.amber700} />
              <Text className="ml-3 text">Local Files</Text>
            </View>
          </Pressable>
          {isLoading && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-col justify-center items-center"
            >
              <Text>Loading Files...</Text>
              <Progress.Bar indeterminate />
            </MotiView>
          )}
        </View>
        {/* BOOK META SEARCH */}
        {folderMetadata && Object.keys(folderMetadata)?.length > 0 && (
          <View
            className="rounded-xl bg-white mt-2"
            style={{
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.amber900,
            }}
          >
            <Link
              href={{
                pathname: "audio/dropbox/searchBooks",
                params: { fullPath: "", backTitle: "Back" },
              }}
            >
              <View className="flex-row px-2 py-3 items-center">
                <SearchIcon color={colors.dropboxBlue} />
                <Text className="ml-3 text">Search Books</Text>
              </View>
            </Link>
          </View>
        )}
      </View>
      <View className="h-2" />

      {/* FAVORITE Folders and Books */}
      <View className="flex-col mx-[11] flex-1" style={{ marginBottom: insets.bottom }}>
        <View className="flex-row justify-between mb-2">
          <MotiView
            className="absolute w-[125] h-[2] bottom-0 left-0 bg-amber-800"
            from={{ translateX: 0 }}
            animate={{ translateX: currTab === "folders" ? 0 : width - 147 }}
          />
          <AnimatedPressable onPress={() => setCurrTab("folders")}>
            <Text
              className={`text-base ${
                currTab === "folders" ? "font-semibold text-amber-800" : "font-normal"
              }`}
            >
              Favorite Folders
            </Text>
          </AnimatedPressable>

          <AnimatedPressable onPress={() => setCurrTab("books")}>
            <Text
              className={`text-base ${
                currTab === "books" ? "font-semibold text-amber-800" : "font-normal"
              }`}
            >
              Favorited Books
            </Text>
          </AnimatedPressable>
        </View>
        {/* NO NETWORK */}
        {!networkActive && (
          <View className="flex-row justify-center items-center border-yellow-500 border-2 rounded-xl p-1 mb-1 bg-red-100">
            <Text className="text-base font-semibold text-red-800">
              Some functionality has been disabled because no internet access was detected.
            </Text>
          </View>
        )}
        <AnimatePresence>
          {currTab === "folders" && networkActive && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "timing", duration: 500 }}
              style={{ flex: 1 }}
            >
              <MainFavFolders />
            </MotiView>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {currTab === "books" && networkActive && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "timing", duration: 500 }}
              style={{ flex: 1 }}
            >
              <ShowFavoritedBooks />
            </MotiView>
          )}
        </AnimatePresence>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerText: {
    fontSize: 14,
    fontColor: "",
  },
});
export default DropboxScreens;
