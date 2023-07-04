/* eslint-disable react-native/no-inline-styles */
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { EditIcon } from "../../common/svg/Icons";

//ADD Delete icon and delete function from Store so Deletoing of item can be tested.
//Update Items array to be generic items (maybe grocery list)
//Make item ids alpha
const TrackDragItem = ({
  name,
  id,
  itemHeight,
  trackNum,
  onRemoveItem,
  onEditItem,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isMoving = false, // injected into component when list created
}: {
  name: string;
  id: string;
  itemHeight: number;
  trackNum: number;
  onRemoveItem?: () => void;
  onEditItem?: (val: string) => void;
  isMoving?: boolean;
}) => {
  const handleEditItem = () => {
    onEditItem(id);
  };
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        height: itemHeight,
        paddingVertical: 10,
        paddingHorizontal: 3,
        backgroundColor: "white",
        borderWidth: 0.5,
        borderColor: "#aaa",
        flex: 1,
      }}
    >
      <View className="flex-row flex-1 items-center">
        <View className="flex-col flex-1">
          <Text
            className="font-bold mr-3 text-base"
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text
            className="font-semibold mr-3 text-gray-600 text-xs"
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {id}
          </Text>
        </View>
        <View className="pr-2">
          <Text className="text-green-900 p-1"> {trackNum}</Text>
        </View>
      </View>

      {/* <TouchableOpacity
        onPress={handleEditItem}
        style={{ position: "absolute", right: 15 }}
      >
        <EditIcon />
      </TouchableOpacity> */}
      {onRemoveItem && (
        <TouchableOpacity
          onPress={onRemoveItem}
          style={{ position: "absolute", right: 15 }}
        >
          <MaterialIcons name="delete" size={25} color="red" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TrackDragItem;
