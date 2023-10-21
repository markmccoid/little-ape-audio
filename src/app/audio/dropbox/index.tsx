import { View, Text, StyleSheet, Dimensions } from "react-native";
import React, { useState } from "react";
import { Link } from "expo-router";
import { DropboxIcon, SearchIcon, StarFilledIcon } from "../../../components/common/svg/Icons";
import { colors } from "../../../constants/Colors";
// import MainFavFolders from "../../../components/dropbox/MainFavFoldersOLD";
import MainFavFolders from "@components/dropbox/MainFavFolders";
import ShowFavoritedBooks from "@components/dropbox/ShowFavoritedBooks";
import { AnimatedPressable } from "@components/common/buttons/Pressables";
import { AnimatePresence, MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const { width, height } = Dimensions.get("window");

const DropboxScreens = () => {
  const [currTab, setCurrTab] = useState<"folders" | "books">("folders");
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 flex-col bg-amber-50"
      // style={{ bottom: insets.bottom }}
    >
      {/* DROPBOX LINK  */}
      <View className="mx-4 my-2">
        <Text className="text-amber-800 font-semibold mb-1 ml-2">Cloud</Text>
        <View
          className="rounded-xl bg-white"
          style={{
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.amber900,
          }}
        >
          <Link
            href={{
              pathname: "audio/dropbox/dropboxstart",
              params: { fullPath: "", backTitle: "Back" },
            }}
          >
            <View className="flex-row px-2 py-3 items-center">
              <DropboxIcon color={colors.dropboxBlue} />
              <Text className="ml-3 text">Dropbox</Text>
            </View>
          </Link>
        </View>
        {/* BOOK META SEARCH */}
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
        <AnimatePresence>
          {currTab === "folders" && (
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
          {currTab === "books" && (
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
