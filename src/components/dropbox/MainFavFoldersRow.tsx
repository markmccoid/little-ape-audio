import { View, Text, StyleSheet, Dimensions, Pressable, TouchableOpacity } from "react-native";
import React, { Ref, useState } from "react";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerProps,
  TapGesture,
  ScrollView,
  TapGestureHandler,
} from "react-native-gesture-handler";
import Animated, {
  SharedValue,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { DeleteIcon, EditIcon, EnterKeyIcon } from "@components/common/svg/Icons";
import { AnimatedPressable } from "@components/common/buttons/Pressables";
import { Bookmark } from "@store/types";
import { AnimatePresence } from "moti";
import { formatSeconds } from "@utils/formatUtils";
import { FavoriteFolders, useDropboxStore } from "@store/store-dropbox";
import { Link, useRouter } from "expo-router";

const { width: SCREEN_WIDTH, height } = Dimensions.get("window");

const TRANSLATE_X_THRESHOLD = SCREEN_WIDTH * 0.15 * -1;

type Props = {
  favFolder: FavoriteFolders;
  simultaneousHandler: ScrollView;
  currentKey: string;
  activeKey: SharedValue<string>;
};
const MainFavFoldersRow = ({ favFolder, simultaneousHandler, currentKey, activeKey }: Props) => {
  const offsetX = useSharedValue(0);
  const isOpen = useSharedValue(false);
  const iconOpacity = useSharedValue(0);
  const iconPos = useSharedValue(0);
  const [isPanActive, setIsPanActive] = useState(false);
  const actions = useDropboxStore((state) => state.actions);
  const router = useRouter();
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        // only reason for the terniary is because I don't want the spring to ever be positive
        { translateX: offsetX.value <= 0 ? offsetX.value : offsetX.value * -1 },
        // { scale: withSpring(isPressed.value ? 1.1 : 1) },
      ],
      // backgroundColor: isPressed.value ? "yellow" : "blue",
    };
  });

  const rIconStyle = useAnimatedStyle(() => {
    return {
      opacity: iconOpacity.value,
      transform: [
        { translateX: iconPos.value },
        // { translateX: offsetX.value + 90 <= 0 ? 0 : offsetX.value + 90 },
      ],
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
      if (result !== favFolder.id && activeKey.value !== undefined) {
        offsetX.value = withSpring(0);
        iconOpacity.value = withTiming(0);
        iconPos.value = withTiming(90);
        isOpen.value = false;
      }
    }
  );

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { isOpen: boolean }
  >({
    onStart(event, context) {
      // console.log(event.translationX, event.absoluteX);
      // If the slide is open, then close it
      activeKey.value = favFolder.id; // Whenever the activeKey changes useAnimatedReaction runs above

      iconOpacity.value = withTiming(1, { duration: 1000 });
      if (isOpen.value) {
        offsetX.value = withSpring(0);
        iconPos.value = withTiming(90);
        isOpen.value = false;
      }
    },
    onActive(event, context) {
      // Only allow to be pulled to the left
      if (event.translationX <= 0) {
        offsetX.value = event.translationX;

        if (event.translationX <= TRANSLATE_X_THRESHOLD && !isOpen.value) {
          iconPos.value = withSpring(0);
          isOpen.value = true;
        } else if (event.translationX > TRANSLATE_X_THRESHOLD) {
          iconPos.value = event.translationX + 90;
        }
      }
    },
    onEnd(event, context) {
      // We are pulling left, so values will be negative.
      // If offsetX is > than the threshold, than we need to close the slide
      // If not, then we will hold the slide open at the threshold.
      // This means if threshold is -120 and offsetX is -56 it IS greater than threshold
      const shouldBeDismissed = offsetX.value > TRANSLATE_X_THRESHOLD;
      // console.log(shouldBeDismissed, offsetX.value, TRANSLATE_X_THRESHOLD);
      if (shouldBeDismissed) {
        offsetX.value = withSpring(0);
        iconOpacity.value = withTiming(0);
        iconPos.value = withTiming(90);
        isOpen.value = false;
        activeKey.value = undefined;
      } else {
        offsetX.value = withSpring(TRANSLATE_X_THRESHOLD);
        iconPos.value = withSpring(0);
        iconOpacity.value = withTiming(1);
        isOpen.value = true;
      }
    },
  });

  // console.log("favFOLDER", favFolder.folderPath);
  return (
    <View className="flex-1 flex-row h-full bg-red-800">
      {/* START -- ICONS REVEALED ON SWIPE */}
      {/* <AnimatedPressable
        onPress={() => console.log("DELETING", favFolder.folderPath)}
      >
        <Animated.View
          style={rIconStyle}
          className="absolute rounded-md w-[35] bg-red-800 h-[35] 
          flex-row justify-center items-center right-[10] top-[3]"
        >
          <DeleteIcon color="white" size={18} />
        </Animated.View>
      </AnimatedPressable> */}

      <Pressable onPress={() => actions.removeFavorite(favFolder.folderPath)}>
        <Animated.View
          style={rIconStyle}
          className={`absolute bg-red-800 h-[50] w-[${Math.floor(SCREEN_WIDTH * 0.15)}]
            right-[0] justify-center items-center bg-amber-200`}
        >
          <DeleteIcon color="white" size={18} />
        </Animated.View>
      </Pressable>

      {/* <AnimatedPressable onPress={() => console.log("HI")}>
        <Animated.View
          style={rIconStyle}
          className="absolute rounded-lg w-[35] bg-amber-800 h-[35] flex-row justify-center items-center right-[50] top-[3]"
        >
          <EditIcon color="white" size={18} />
        </Animated.View>
      </AnimatedPressable> */}
      {/* END -- ICONS REVEALED ON SWIPE */}
      {/* PUT A TAP GESTURE ON THIS TO OPEN THE LINK */}
      <PanGestureHandler
        onGestureEvent={gestureHandler}
        simultaneousHandlers={simultaneousHandler}
        onActivated={() => setIsPanActive(true)}
        onEnded={() => setIsPanActive(false)}
      >
        <Animated.View
          style={animatedStyles}
          className={`py-1 px-2 bg-amber-100 mb-0 flex-1 h-full ${isPanActive ? "border-l" : ""}`}
        >
          <View className="flex-row items-center h-full w-full ">
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/audio/dropbox/newdir",
                  params: { fullPath: favFolder.folderPath, backTitle: "Back" },
                })
              }
              disabled={isOpen.value}
            >
              <Text className="text-sm font-semibold">{favFolder.folderPath}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    position: "absolute",
  },
});
export default MainFavFoldersRow;

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
