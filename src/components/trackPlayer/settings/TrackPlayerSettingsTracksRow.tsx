import {
  Animated as RNAnimated,
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import React from "react";
import { Swipeable } from "react-native-gesture-handler";
import { BuildList } from "./TrackPlayerSettingsTracks";
import {
  DeleteIcon,
  DragHandleIcon,
  EditIcon,
} from "@components/common/svg/Icons";
import { usePlaybackStore, useTrackActions } from "@store/store";

import { colors } from "@constants/Colors";

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
  const isFirst = item.pos === 0;

  return (
    <Swipeable
      ref={(ref) => (renderRowRefs[index] = ref)}
      onSwipeableOpen={() => closeRow(index)}
      renderRightActions={(progress, dragX) => {
        return <RenderRight item={item} progress={progress} dragX={dragX} />;
      }}
      rightThreshold={45}
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

const RenderRight = ({
  item,
  progress,
  dragX,
}: {
  item;
  progress: RNAnimated.AnimatedInterpolation<string | number>;
  dragX: RNAnimated.AnimatedInterpolation<string | number>;
}) => {
  const playbackActions = usePlaybackStore((state) => state.actions);
  const currPlaylistId = usePlaybackStore((state) => state.currentPlaylistId);

  const iconScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
    extrapolate: "clamp",
  });
  const icon2Scale = progress.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp",
  });
  const drag = dragX.interpolate({
    inputRange: [-400, -82, 0],
    outputRange: [82 - 400, 0, 82],
    extrapolate: "clamp",
  });

  return (
    <RNAnimated.View
      className="flex-row items-center justify-end w-[82] bg-amber-200 border-b border-b-amber-900"
      style={{ opacity: progress, transform: [{ translateX: drag }] }}
    >
      <Pressable
        onPress={() => {
          playbackActions.removePlaylistTrack(currPlaylistId, item.id);
        }}
        className="h-full justify-center bg-amber-400 border-r border-l border-amber-600"
      >
        <RNAnimated.View
          className="w-[40] items-center"
          style={{ transform: [{ scale: iconScale }] }}
        >
          <DeleteIcon color={colors.deleteRed} />
        </RNAnimated.View>
      </Pressable>
      <Pressable
        onPress={() => {
          Alert.alert("Edit Not Implemented Yet");
        }}
        className="h-full justify-center bg-amber-400"
      >
        <RNAnimated.View
          className="w-[40] items-center"
          style={{ transform: [{ scale: icon2Scale }] }}
        >
          <EditIcon color={colors.amber900} />
        </RNAnimated.View>
      </Pressable>
    </RNAnimated.View>
  );
};
