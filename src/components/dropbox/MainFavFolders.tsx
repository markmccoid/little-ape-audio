import { View, Text, TouchableOpacity, Pressable } from "react-native";
import React, { useRef, useState } from "react";
import { FavoriteFolders, useDropboxStore } from "@store/store-dropbox";
import DraggableFlatList, {
  OpacityDecorator,
} from "react-native-draggable-flatlist";
import {
  DeleteIcon,
  DragHandleIcon,
  StarFilledIcon,
} from "@components/common/svg/Icons";
import { Link } from "expo-router";
import MainFavFoldersRow from "./MainFavFoldersRow";
import { useSharedValue } from "react-native-reanimated";
import SwipeableItem, {
  useSwipeableItemParams,
} from "react-native-swipeable-item";

type Props = {
  favFolders: FavoriteFolders[];
};
const MainFavFolders = () => {
  const favFolders = useDropboxStore((state) => state.favoriteFolders) || [];
  const activeKey = useSharedValue(undefined);
  const actions = useDropboxStore((state) => state.actions);
  const [extra, setExtra] = useState(false);
  const flatRef = useRef();
  const renderItem = ({
    item,
    drag,
    isActive,
  }: {
    item: FavoriteFolders;
    drag: any;
    isActive: boolean;
  }) => {
    const isFirst = item.position === 1;
    const isLast = item.position === favFolders.length;
    // console.log(`${isFirst ? "--->" : ""} ${item.id}`);

    return (
      <OpacityDecorator activeOpacity={0.9}>
        <View
          id={item.id}
          className={`bg-white w-full flex-row h-[50] border border-amber-900 items-center
          ${isFirst ? "rounded-t-lg border-b-0" : "border-b-0"}
          ${isLast ? "rounded-b-lg border-b" : ""}
          ${isActive ? "border border-amber-500 bg-white" : ""}`}
        >
          <Pressable
            onPressIn={drag}
            disabled={isActive}
            key={item.id}
            className="px-2 border-r border-amber-900 h-full justify-center"
          >
            <StarFilledIcon />
          </Pressable>
          <Link
            href={{
              pathname: "/audio/dropbox/newdir",
              params: { fullPath: item.folderPath, backTitle: "Back" },
            }}
            className="flex-1"
          >
            <View className="flex-row flex-1 items-center ">
              <Text
                className="ml-3 text"
                ellipsizeMode="tail"
                numberOfLines={2}
              >
                {item.folderPath}
              </Text>
            </View>
          </Link>
          <TouchableOpacity
            onPress={() => actions.removeFavorite(item.folderPath)}
            className="pr-4"
          >
            <DeleteIcon />
          </TouchableOpacity>
        </View>
      </OpacityDecorator>
    );
  };
  //~ Drag End
  const onDragEnd = (data: FavoriteFolders[]) => {
    let newData = [];
    for (let i = 0; i < data.length; i++) {
      newData.push({ ...data[i], position: i + 1 });
    }
    // save to store
    actions.updateFavFolderArray(newData);
    setExtra((prev) => !prev);
  };
  return (
    <DraggableFlatList
      extraData={extra}
      ref={flatRef}
      data={favFolders}
      renderPlaceholder={() => (
        <View className="bg-amber-300 w-full h-full">
          <Text></Text>
        </View>
      )}
      onDragEnd={({ data }) => onDragEnd(data)}
      // onDragEnd={({ data }) => actions.updateFavFolderArray(data)}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
    />
  );
};

export default MainFavFolders;
