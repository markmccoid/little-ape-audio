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
import { Gesture, GestureDetector } from "react-native-gesture-handler";

type Item = {
  key: string;
  text: string;
  backgroundColor: string;
};
const NUM_ITEMS = 10;

const DragListItem = ({ item, drag, isActive, flatRef }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const transX = useSharedValue(0);
  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      console.log(event.translationX);
      transX.value = event.translationX;
    })
    .onStart((event) => {
      console.log("Y", event.translationY);
      // if (event.translationY !== 0) {
      runOnJS(setIsEnabled)(true);
      // }
    })
    .onEnd((event) => {
      console.log("END", event.translationX);
    });
  // .enabled(isEnabled);

  const nativeGesture = Gesture.Native();
  const composedGestures = Gesture.Simultaneous(gesture, nativeGesture);
  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: transX.value }],
    };
  });

  return (
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

      <GestureDetector gesture={composedGestures}>
        <Animated.View
          className="flex-row flex-1 items-center justify-center p-[15]"
          style={[
            rStyle,
            { backgroundColor: item.backgroundColor, height: 100 },
          ]}
        >
          <Text className="text-white font-semibold">{`${item.text}`}</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default DragListItem;
