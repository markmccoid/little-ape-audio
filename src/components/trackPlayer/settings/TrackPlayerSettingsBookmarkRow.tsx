import { View, Text, StyleSheet, Dimensions } from "react-native";
import React, { useState } from "react";
import {
  ScrollView,
  Gesture,
  GestureDetector,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { DeleteIcon, EditIcon, EnterKeyIcon } from "../../common/svg/Icons";
import { AnimatedPressable } from "../../common/buttons/Pressables";
import { Bookmark } from "../../../store/types";
import { formatSeconds } from "../../../utils/formatUtils";
import usePlaylistColors from "hooks/usePlaylistColors";
import { usePlaybackStore } from "@store/store";
import { useUIStore, useUIActions } from "@store/store-ui";
import { useFocusEffect } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const TRANSLATE_X_THRESHOLD = SCREEN_WIDTH * 0.25 * -1;

type Props = {
  bookmark: Bookmark;
  simultaneousHandler: React.RefObject<ScrollView | null>;
  activeKey: SharedValue<string>;
  onDeleteBookmark: (bookmarkId: string) => void;
  onApplyBookmark: (bookmarkId: string) => void;
};
const BookmarkRow = ({
  bookmark,
  simultaneousHandler,
  activeKey,
  onDeleteBookmark,
  onApplyBookmark,
}: Props) => {
  const offsetX = useSharedValue(0);
  const isOpen = useSharedValue(false);
  const iconOpacity = useSharedValue(0);
  const iconPos = useSharedValue(0);
  const playlistColors = usePlaylistColors();
  const currentPlaylistId = usePlaybackStore((state) => state.currentPlaylistId);
  const uiActions = useUIActions();
  const bookmarkModalVisible = useUIStore((state) => state.bookmarkModalVisible);

  React.useEffect(() => {
    if (!bookmarkModalVisible) {
      offsetX.value = withSpring(0);
      iconOpacity.value = withTiming(0);
      iconPos.value = withTiming(90);
      isOpen.value = false;
      activeKey.value = undefined;
    }
  }, [bookmarkModalVisible]);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offsetX.value <= 0 ? offsetX.value : offsetX.value * -1 }],
    };
  });

  const rIconStyle = useAnimatedStyle(() => {
    return {
      opacity: iconOpacity.value,
      transform: [{ translateX: iconPos.value }],
    };
  });

  // This reaction will make sure that only the "active" row
  // is open.  If the activeKey is not the key of the row
  // of the reaction, then we close the slide
  useAnimatedReaction(
    () => {
      return activeKey.value;
    },
    (result, previous) => {
      if (result !== bookmark.id && activeKey.value !== undefined) {
        offsetX.value = withSpring(0);
        iconOpacity.value = withTiming(0);
        iconPos.value = withTiming(90);
        isOpen.value = false;
      }
    },
    [bookmark.id]
  );

  const panGesture = Gesture.Pan()
    .onStart(() => {
      activeKey.value = bookmark.id;
      iconOpacity.value = withTiming(1, { duration: 1000 });
      // console.log("OPEN", isOpen.value);
      if (isOpen.value) {
        offsetX.value = withSpring(0);
        iconPos.value = withTiming(90);
        isOpen.value = false;
      }
    })
    .onUpdate((event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      if (event.translationX <= 0) {
        offsetX.value = event.translationX;

        if (event.translationX <= TRANSLATE_X_THRESHOLD && !isOpen.value) {
          iconPos.value = withSpring(0);
          isOpen.value = true;
        } else if (event.translationX > TRANSLATE_X_THRESHOLD) {
          iconPos.value = event.translationX + 90;
        }
      }
    })
    .onEnd(() => {
      const shouldBeDismissed = offsetX.value > TRANSLATE_X_THRESHOLD;
      // console.log(offsetX.value, TRANSLATE_X_THRESHOLD, shouldBeDismissed);
      if (shouldBeDismissed) {
        offsetX.value = withSpring(0);
        iconOpacity.value = withTiming(0);
        iconPos.value = withTiming(90);
        isOpen.value = false;
        activeKey.value = undefined;
      } else {
        // console.log("OPEN");
        offsetX.value = withSpring(TRANSLATE_X_THRESHOLD);
        iconPos.value = withSpring(0);
        iconOpacity.value = withTiming(1);
        isOpen.value = true;
        activeKey.value = bookmark.id;
      }
    })
    .activeOffsetX([-20, 20])
    .failOffsetY([-20, 20])
    .simultaneousWithExternalGesture(simultaneousHandler);

  const tapGesture = Gesture.Tap().onEnd(() => {
    if (isOpen.value) {
      offsetX.value = withSpring(0);
      iconOpacity.value = withTiming(0);
      iconPos.value = withTiming(90);
      isOpen.value = false;
      activeKey.value = undefined;
    }
  });

  const gesture = Gesture.Race(panGesture, tapGesture);

  return (
    <View className="w-full" style={{ backgroundColor: playlistColors.bg }}>
      {/* START -- ICONS REVEALED ON SWIPE */}
      <AnimatedPressable onPress={() => onDeleteBookmark(bookmark.id)}>
        <Animated.View
          style={rIconStyle}
          className="absolute rounded-lg w-[35] bg-red-800 h-[35] flex-row justify-center items-center right-[10] top-[3]"
        >
          <DeleteIcon color="white" size={18} />
        </Animated.View>
      </AnimatedPressable>
      {/* !! DO WE NEED PLAYLIST ID FOR EDIT kind of, not assuming we can grab current????  !! */}
      <AnimatedPressable
        onPress={() => {
          uiActions.openBookmarkModal({ bookmarkId: bookmark.id, playlistId: currentPlaylistId });
        }}
      >
        <Animated.View
          style={rIconStyle}
          className="absolute rounded-lg w-[35] bg-white h-[35] flex-row justify-center items-center right-[50] top-[3]"
        >
          <EditIcon color="black" size={18} />
        </Animated.View>
      </AnimatedPressable>

      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[animatedStyles, { borderWidth: 1, borderColor: playlistColors.bgBorder }]}
          className="py-1 px-2 bg-white mb-0"
        >
          <View className="flex-row items-center">
            <AnimatedPressable onPress={() => onApplyBookmark(bookmark.id)}>
              <View
                className="mr-4 p-1  bg-amber-200 rounded-lg"
                style={{
                  borderWidth: 1,
                  borderColor: playlistColors.btnBorder,
                  backgroundColor: playlistColors.btnBg,
                }}
              >
                <EnterKeyIcon color={playlistColors.btnText} />
              </View>
            </AnimatedPressable>
            <View>
              <Text className="text-sm font-semibold">{bookmark.name}</Text>
              <Text className="text-xs">{formatSeconds(bookmark.positionSeconds)}</Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    position: "absolute",
  },
});
export default BookmarkRow;

{
  /* <TouchableOpacity
              key={el.id}
              onPress={async () => handleApplyBookmark(el.id)}
              onLongPress={async () => handleDeleteBookmark(el.id)}
              className="flex-col justify-between px-1 py-2"
              style={{
                borderBottomColor: colors.amber800,
                borderBottomWidth: StyleSheet.hairlineWidth,
              }}
            >
              <View className="flex-row justify-between flex-1">
                <Text className="font-semibold">{el.name}</Text>
                <Text>{formatSeconds(el.positionSeconds)}</Text>
              </View>
              <Text>Track: {el.trackId}</Text>
            </TouchableOpacity> */
}
