import {
  View,
  Text,
  // FlatList,
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
  FlatList,
} from "react-native-gesture-handler";
import DragListItem from "@components/xplayarea/DragListItem";

type Item = {
  key: string;
  text: string;
  backgroundColor: string;
};
const NUM_ITEMS = 10;

const initialData: Item[] = [...Array(NUM_ITEMS)].fill(0).map((d, index) => {
  const backgroundColor = getColor(index);
  return {
    text: `${index}`,
    key: `key-${backgroundColor}`,
    backgroundColor,
  };
});

const playarea = () => {
  const flatRef = useRef(null);
  let prevOpenedRow = undefined;
  let row = [];

  const closeRow = (index) => {
    if (prevOpenedRow && prevOpenedRow !== row[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = row[index];
  };

  const renderItem = useCallback((props) => {
    console.log("index", props.getIndex());
    return (
      <DragListItem
        item={props.item}
        drag={props.drag}
        isActive={props.isActive}
        index={props.getIndex()}
        closeRow={closeRow}
        row={row}
      />
    );
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <DraggableFlatList
        ref={flatRef}
        keyExtractor={(item) => item.key}
        data={initialData}
        renderItem={renderItem}
      />
    </View>
  );
};

function getColor(i: number) {
  const multiplier = 255 / (NUM_ITEMS - 1);
  const colorVal = i * multiplier;
  return `rgb(${colorVal}, ${Math.abs(128 - colorVal)}, ${255 - colorVal})`;
}

export default playarea;
