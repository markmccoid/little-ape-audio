import { View, Text, TouchableOpacity, StyleSheet, Image, Pressable } from "react-native";
import React, { useEffect, useMemo } from "react";
import { FolderAttributeItem, useDropboxStore } from "@store/store-dropbox";
import { ScrollView } from "react-native-gesture-handler";
import { Link, useRouter } from "expo-router";
import { colors } from "@constants/Colors";
import DraggableFlatList from "react-native-draggable-flatlist";
import * as FileSystem from "expo-file-system";
import { customEncodeParens } from "@utils/otherUtils";

const ShowFavoritedBooks = () => {
  const actions = useDropboxStore((state) => state.actions);
  const folderAttributes = useDropboxStore((state) => state.folderAttributes);

  const favBooks = folderAttributes
    .filter((el) => el.isFavorite)
    .sort((a, b) => a.favPosition - b.favPosition);
  const router = useRouter();

  const renderItem = ({
    item,
    drag,
    isActive,
  }: {
    item: FolderAttributeItem;
    drag: any;
    isActive: boolean;
  }) => {
    const imageURI = item?.imageURL
      ? item.imageURL.replace(/^http:\/\//, "https://")
      : item?.localImageName
      ? `${FileSystem.documentDirectory}${item.localImageName}`
      : item.defaultImage;

    const absParams = item?.audioSource === "abs" && {};

    let routerPush = () =>
      router.push({
        pathname: `/(audio)/dropbox/favBook`,
        params: {
          fullPath: customEncodeParens(item?.pathToFolder),
          backTitle: "Back",
          audioSource: item.audioSource,
          parentFolderId: customEncodeParens(item?.parentFolder),
        },
      });

    if (item.audioSource === "abs") {
      routerPush = () =>
        router.push({
          pathname: `/(audio)/dropbox/audiobookshelf/${item.pathToFolder}`,
          params: {
            title: item.title,
          },
        });
    }
    return (
      // <ScaleDecorator activeScale={0.98}>
      <View
        className="flex-row w-full items-center border rounded-md mb-2 bg-abs-50"
        key={item.id}
        style={{
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.amber900,
        }}
      >
        <Pressable
          onPressIn={drag}
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? "rgb(210, 230, 255)" : "white",
              // scale: pressed ? 1.5 : 1,
              zIndex: 10,
            },
          ]}
          disabled={isActive}
          key={item.id}
          // className="px-2 border-r border-amber-900 h-full justify-center"
        >
          <View className="flex-col rounded-l-md  bg-white justify-start " style={styles.shadow}>
            <Image
              style={{ width: 60, height: 72 }}
              source={{ uri: imageURI }}
              className="rounded-l-md"
            />
          </View>
        </Pressable>

        <TouchableOpacity onPress={() => routerPush()}>
          <View className="flex-row justify-start w-full mb-1">
            <View className="flex-col justify-start w-full ">
              <Text
                className="font-semibold text-sm pl-3"
                style={{
                  backgroundColor:
                    item.audioSource === "dropbox"
                      ? colors.dropboxBlue
                      : item.audioSource === "google"
                      ? colors.amber500
                      : colors.abs700,
                  color:
                    item.audioSource === "dropbox"
                      ? "white"
                      : item.audioSource === "google"
                      ? colors.amber900
                      : colors.abs50,
                }}
              >
                {item.categoryOne} - {item.categoryTwo}
              </Text>
              <Text className="text-base font-bold px-2" style={{}}>
                {item.title}
              </Text>
              <Text className="text-base px-2" style={{}}>
                by {item.author}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      // </ScaleDecorator>
    );
  };
  //!!
  const onDragEnd = (data: FolderAttributeItem[]) => {
    let newData = [] as FolderAttributeItem[];
    for (let i = 0; i < data.length; i++) {
      newData.push({ ...data[i], favPosition: i + 1 });
    }

    // save to store
    actions.updateFoldersAttributePosition("favPosition", newData);
    // setExtra((prev) => !prev);
  };
  return (
    <DraggableFlatList
      nestedScrollEnabled={true}
      data={favBooks}
      renderPlaceholder={() => (
        <View className="bg-amber-300 w-full h-full">
          <Text></Text>
        </View>
      )}
      onDragEnd={({ data }) => onDragEnd(data)}
      // onDragEnd={({ data }) => actions.updateFavFolderArray(data)}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      style={
        {
          // maxHeight: 220,
          // borderWidth: StyleSheet.hairlineWidth,
          // borderColor: colors.amber700,
          // borderRadius: 10,
        }
      }
    />
  );
};

const styles = StyleSheet.create({
  trackImage: {
    width: 100,
    height: 100 * 1.28,
    borderRadius: 10,
    resizeMode: "stretch",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.amber900,
  },
  shadow: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0.5,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5.62,
  },
});

export default ShowFavoritedBooks;
