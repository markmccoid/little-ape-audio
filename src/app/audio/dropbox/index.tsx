import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Link } from "expo-router";
import {
  DropboxIcon,
  StarFilledIcon,
} from "../../../components/common/svg/Icons";
import { useDropboxStore } from "../../../store/store-dropbox";
import { colors } from "../../../constants/Colors";
// import MainFavFolders from "../../../components/dropbox/MainFavFoldersOLD";
import MainFavFolders from "@components/dropbox/MainFavFolders";

const DropboxScreens = () => {
  const favFolders = useDropboxStore((state) => state.favoriteFolders) || [];

  return (
    <View className="flex-1 flex-col bg-amber-50">
      <View className="m-4">
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
      <View className="m-4">
        <Text className="text-amber-800 font-semibold mb-1 ml-2">
          Favorites
        </Text>
        <View
          className="rounded-xl bg-white"
          style={{
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.amber900,
          }}
        >
          {/* <MainFavFolders favFolders={favFolders} /> */}
          <MainFavFolders favFolders={favFolders} />
        </View>
        <View className="h-4" />
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
