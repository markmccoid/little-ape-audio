import { View, Text, StyleSheet, ScrollView } from "react-native";
import React, { useState } from "react";
import { Link } from "expo-router";
import {
  DropboxIcon,
  StarFilledIcon,
} from "../../../components/common/svg/Icons";
import { useDropboxStore } from "../../../store/store-dropbox";
import { colors } from "../../../constants/Colors";
// import MainFavFolders from "../../../components/dropbox/MainFavFoldersOLD";
import MainFavFolders from "@components/dropbox/MainFavFolders";
import Animated from "react-native-reanimated";
import ShowFavoritedBooks from "@components/dropbox/ShowFavoritedBooks";
import { AnimatedPressable } from "@components/common/buttons/Pressables";
import { AnimatePresence, MotiView } from "moti";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
// import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const DropboxScreens = () => {
  const favFolders = useDropboxStore((state) => state.favoriteFolders) || [];
  const [currTab, setCurrTab] = useState<"folders" | "books">("folders");
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 flex-col bg-amber-50"
      // style={{ bottom: insets.bottom }}
    >
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
              <DropboxIcon />
              <Text className="ml-3 text">Dropbox</Text>
            </View>
          </Link>
        </View>
      </View>
      <View className="h-2" />

      <View
        className="flex-col mx-3 flex-1"
        style={{ marginBottom: insets.bottom }}
      >
        <View className="flex-row justify-between mb-2">
          <AnimatedPressable onPress={() => setCurrTab("folders")}>
            <Text
              className={`text-base ${
                currTab === "folders" ? "font-semibold" : "font-normal"
              }`}
            >
              Favorite Folders
            </Text>
          </AnimatedPressable>

          <AnimatedPressable onPress={() => setCurrTab("books")}>
            <Text
              className={`text-base ${
                currTab === "books" ? "font-semibold" : "font-normal"
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
      {/* FAVORITE FOLDERS  */}
      {/* ---------- */}
      {/* <View className="mx-4 my-2">
        <Text className="text-amber-800 font-semibold mb-1 ml-2">
          Favorite Folders
        </Text>
        <View className="bg-white">
          <MainFavFolders />
        </View>
      </View> */}
      {/*  */}
      {/* <View className="flex-1 mx-4 my-2 mb-10">
        <Text className="text-amber-800 font-semibold mb-1 ml-2">
          Favorited Books
        </Text>
        <ShowFavoritedBooks />
      </View> */}
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
