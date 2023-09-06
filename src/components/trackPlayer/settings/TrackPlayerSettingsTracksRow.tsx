import { View, Text, Pressable, StyleSheet } from "react-native";
import React from "react";
import { Swipeable } from "react-native-gesture-handler";
import { BuildList } from "./TrackPlayerSettingsTracks";
import {
  DeleteIcon,
  DragHandleIcon,
  EditIcon,
} from "@components/common/svg/Icons";
import { usePlaybackStore, useTrackActions } from "@store/store";
import { usePlaybackState } from "react-native-track-player";

type Unpacked<T> = T extends (infer U)[] ? U : T;

type Props = {
  item: Unpacked<BuildList>;
  drag: any;
  isActive: boolean;
  index: number;
  renderRowRefs: Swipeable[];
  closeRow: (index: number) => void;
};
function TrackPlayerSettingsTracksRow({
  item,
  drag,
  isActive,
  index,
  renderRowRefs,
  closeRow,
}: Props) {
  const trackActions = useTrackActions();
  const playbackActions = usePlaybackStore((state) => state.actions);
  const currPlaylistId = usePlaybackStore((state) => state.currentPlaylistId);
  const isFirst = item.pos === 0;

  return (
    <Swipeable
      ref={(ref) => (renderRowRefs[index] = ref)}
      onSwipeableOpen={() => closeRow(index)}
      renderRightActions={(progress, dragX) => {
        console.log("PROG", progress, dragX);
        return (
          <View className="flex-row items-center justify-end w-[100] bg-amber-200">
            <Pressable
              onPress={() => {
                playbackActions.removePlaylistTrack(currPlaylistId, item.id);
                console.log("Deleted", item.id);
              }}
              className="w-[33]"
            >
              <DeleteIcon />
            </Pressable>
            <Pressable
              onPress={() => {
                console.log("Deleted", item.id);
              }}
              className="w-[33]"
            >
              <EditIcon />
            </Pressable>
          </View>
        );
      }}
      rightThreshold={100}
      leftThreshold={10}
    >
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderTopWidth: isActive || isFirst ? StyleSheet.hairlineWidth : 0,
          backgroundColor: "white",
        }}
      >
        <Pressable
          onPressIn={drag}
          disabled={isActive}
          key={item.id}
          className=" px-2 border-r border-amber-900 h-[50] justify-center items-center"
        >
          <DragHandleIcon />
        </Pressable>
        <View className="flex-row flex-1 items-center ">
          <View className="flex-col flex-1 ml-2">
            <Text
              className="font-bold mr-3 text-base"
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              className="font-semibold mr-3 text-gray-600 text-xs"
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {item.id}
            </Text>
          </View>
          <View className="pr-2">
            <Text className="text-green-900 p-1"> {item.trackNum}</Text>
          </View>
        </View>
      </View>
    </Swipeable>
  );
}

export default TrackPlayerSettingsTracksRow;
