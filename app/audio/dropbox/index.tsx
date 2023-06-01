import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Link } from "expo-router";
import {
  DropboxIcon,
  StarFilledIcon,
} from "../../../src/components/common/svg/Icons";
import { useDropboxStore } from "../../../src/store/store-dropbox";

const DropboxScreens = () => {
  const favFolders = useDropboxStore((state) => state.favoriteFolders) || [];

  return (
    <View className="flex-col">
      <View className="m-4">
        <Text className="text-amber-800 font-semibold mb-1 ml-2">Cloud</Text>
        <View className="rounded-xl bg-white">
          <Link
            href={{
              pathname: "./dropbox/newdir",
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
        <View className="rounded-xl bg-white">
          {favFolders.map((folder) => {
            return (
              <View
                key={folder.id}
                className=" border-b-amber-800"
                style={{ borderBottomWidth: StyleSheet.hairlineWidth }}
              >
                <Link
                  href={{
                    pathname: "./dropbox/newdir",
                    params: { fullPath: folder.folderPath, backTitle: "Back" },
                  }}
                >
                  <View className="flex-row px-2 py-3 items-center">
                    <StarFilledIcon />
                    <Text className="ml-3 text">{folder.folderPath}</Text>
                  </View>
                </Link>
              </View>
            );
          })}
        </View>
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
