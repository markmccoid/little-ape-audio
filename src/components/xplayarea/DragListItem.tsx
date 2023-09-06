import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Touchable,
  Pressable,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import Animated, {
  interpolate,
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import SwipeableItem, {
  useSwipeableItemParams,
} from "react-native-swipeable-item";
import DraggableFlatList from "react-native-draggable-flatlist";
import { colors } from "@constants/Colors";
import {
  Gesture,
  GestureDetector,
  Swipeable,
} from "react-native-gesture-handler";

type Item = {
  key: string;
  text: string;
  backgroundColor: string;
};
const NUM_ITEMS = 10;

const DragListItem = ({ item, drag, isActive, index, closeRow, row }) => {
  return (
    <Swipeable
      renderRightActions={(progress, dragX) => (
        <View>
          <Text>HI</Text>
        </View>
      )}
      onSwipeableOpen={() => closeRow(index)}
      ref={(ref) => (row[index] = ref)}
      rightThreshold={-100}
    >
      <View className="flex-1 flex-row">
        <Pressable
          onLongPress={drag}
          disabled={isActive}
          className="flex-1 border bg-yellow-600 w-[100]"
          // style={[
          //   { backgroundColor: isActive ? "red" : colors.amber400, width: 100 },
          // ]}
        >
          <View className="border bg-yellow-600 w-[100]">
            <Text>DRAG</Text>
          </View>
        </Pressable>
        {/* <GestureDetector gesture={composedGestures}> */}
        <Animated.View
          className="flex-row flex-1 items-center justify-center p-[15]"
          style={[{ backgroundColor: item.backgroundColor, height: 100 }]}
        >
          <Text className="text-white font-semibold">{`${item.text}`}</Text>
        </Animated.View>
        {/* </GestureDetector> */}
      </View>
    </Swipeable>
  );
};

export default DragListItem;
