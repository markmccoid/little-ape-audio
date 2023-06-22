import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { FavoriteFolders, useDropboxStore } from "../../store/store-dropbox";
import { Link } from "expo-router";
import { DeleteIcon, StarFilledIcon } from "../common/svg/Icons";
import DragDropEntry, {
  sortArray,
} from "@markmccoid/react-native-drag-and-order";

type Props = {
  favFolders: FavoriteFolders[];
};
const MainFavFolders = ({ favFolders }) => {
  const actions = useDropboxStore((state) => state.actions);
  return (
    <DragDropEntry
      scrollStyles={{
        // width: "100%",
        // height: "30%",
        borderWidth: 1,
        borderColor: "#aaa",
        borderRadius: 10,
      }}
      updatePositions={(positions) => {
        const newFavOrder = sortArray(positions, favFolders, {
          positionField: "position",
          idField: "id",
        }) as FavoriteFolders[];
        actions.updateFavFolderArray(newFavOrder);
      }}
      //getScrollFunctions={(functionObj) => setScrollFunctions(functionObj)}
      itemHeight={50}
      handlePosition="left"
      //handle={AltHandle} // This is optional.  leave out if you want the default handle
      handle={() => (
        <View
          className="justify-center flex-grow bg-white px-2"
          style={{
            borderWidth: StyleSheet.hairlineWidth,
          }}
        >
          <StarFilledIcon />
        </View>
      )}
      enableDragIndicator={true}
    >
      {favFolders.map((folder, index) => {
        const lastItem = favFolders.length === index + 1;
        return (
          <View
            key={folder.id}
            id={folder.id}
            className={`justify-between items-center bg-white flex-row`}
            style={{
              borderWidth: StyleSheet.hairlineWidth,
              borderBottomRightRadius: lastItem ? 10 : 0,
              borderTopRightRadius: index === 0 ? 10 : 0,
              height: 50,
              flex: 1,
            }}
          >
            <Link
              href={{
                pathname: "./dropbox/newdir",
                params: { fullPath: folder.folderPath, backTitle: "Back" },
              }}
              className="flex-1"
            >
              <View className="flex-row flex-1 items-center ">
                <Text
                  className="ml-3 text"
                  ellipsizeMode="tail"
                  numberOfLines={2}
                >
                  {folder.folderPath}
                </Text>
              </View>
            </Link>
            <TouchableOpacity
              onPress={() => actions.removeFavorite(folder.folderPath)}
              className="pr-4"
            >
              <DeleteIcon />
            </TouchableOpacity>
          </View>
        );
      })}
    </DragDropEntry>
  );
};

export default MainFavFolders;
