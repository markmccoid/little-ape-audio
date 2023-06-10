import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { FavoriteFolders, useDropboxStore } from "../../store/store-dropbox";
import { Link } from "expo-router";
import { StarFilledIcon } from "../common/svg/Icons";
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
        // console.log(
        //   "positions",
        //   sortArray(positions, favFolders, {
        //     positionField: "position",
        //     idField: "id",
        //   })
        // )

        // updateItemList(sortArray<ItemType>(positions, items, "pos"))
      }}
      //getScrollFunctions={(functionObj) => setScrollFunctions(functionObj)}
      itemHeight={50}
      handlePosition="left"
      //handle={AltHandle} // This is optional.  leave out if you want the default handle
      handle={() => (
        <View
          className="justify-center flex-grow  px-2"
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
            className={`justify-center`}
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
            >
              <View className="flex-row px-2 py-3 items-center">
                {/* <StarFilledIcon /> */}
                <Text className="ml-3 text">{folder.folderPath}</Text>
              </View>
            </Link>
          </View>
        );
      })}
    </DragDropEntry>
  );
};

export default MainFavFolders;
