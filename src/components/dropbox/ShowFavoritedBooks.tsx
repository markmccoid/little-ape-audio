import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Pressable,
} from "react-native";
import React, { useEffect, useMemo } from "react";
import { FolderAttributeItem, useDropboxStore } from "@store/store-dropbox";
import { ScrollView } from "react-native-gesture-handler";
import { Link, useRouter } from "expo-router";
import { colors } from "@constants/Colors";
import DraggableFlatList, {
  OpacityDecorator,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import * as FileSystem from "expo-file-system";

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
      ? item.imageURL
      : item?.localImageName
      ? `${FileSystem.documentDirectory}${item.localImageName}`
      : item.defaultImage;

    return (
      // <ScaleDecorator activeScale={0.98}>
      <View
        className="flex-row bg-white w-full"
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
          <View
            className="flex-col bg-white justify-start"
            style={styles.shadow}
          >
            <Image
              style={{ width: 50, height: 72 }}
              source={{ uri: imageURI }}
            />
          </View>
        </Pressable>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: `/audio/dropbox/favBook`,
              params: {
                fullPath: item?.pathToFolder,
                backTitle: "Back",
              },
            })
          }
        >
          <View className="flex-row justify-start w-full mb-1">
            <View className="flex-col justify-start w-full ">
              <Text className="font-semibold text-sm pl-3 bg-amber-500">
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
    //!  Need to update all items positions
    //! how to send and how to update???
    actions.updateFoldersAttributePosition("favPosition", newData);
    // setExtra((prev) => !prev);
  };
  return (
    <DraggableFlatList
      nestedScrollEnabled={true}
      data={favBooks}
      renderPlaceholder={() => (
        <View className="bg-amber-300 w-full h-full">
          <Text>HOLD</Text>
        </View>
      )}
      onDragEnd={({ data }) => onDragEnd(data)}
      // onDragEnd={({ data }) => actions.updateFavFolderArray(data)}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      style={{
        // maxHeight: 220,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.amber700,

        // borderRadius: 10,
      }}
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
