import { View, Text, StyleSheet, Dimensions, Pressable } from "react-native";
import React, { Ref } from "react";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerProps,
  ScrollView,
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
import { CleanBookMetadata } from "../../utils/audiobookMetadata";
import { DeleteIcon, EditIcon } from "../common/svg/Icons";
import { AnimatedPressable } from "../common/buttons/Pressables";

const { width: SCREEN_WIDTH, height } = Dimensions.get("window");

const TRANSLATE_X_THRESHOLD = SCREEN_WIDTH * 0.3 * -1;

type Props = {
  folderMetadata: Partial<CleanBookMetadata>;
  simultaneousHandler: ScrollView;
  currentKey: string;
  activeKey: SharedValue<string>;
};
const MetadataRow = ({
  folderMetadata,
  simultaneousHandler,
  currentKey,
  activeKey,
}: Props) => {
  const offsetX = useSharedValue(0);
  const isOpen = useSharedValue(false);
  const iconOpacity = useSharedValue(0);
  const iconPos = useSharedValue(0);

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
      if (result !== currentKey && activeKey.value !== undefined) {
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
      activeKey.value = currentKey; // Whenever the activeKey changes useAnimatedReaction runs above

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

  return (
    <View className="w-full h-[50]">
      <AnimatedPressable onPress={() => console.log("HI")}>
        <Animated.View
          style={rIconStyle}
          className="absolute rounded-lg w-[35] bg-red-800 h-[35] flex-row justify-center items-center right-[10] top-[3]"
        >
          <DeleteIcon color="white" size={18} />
        </Animated.View>
      </AnimatedPressable>
      <AnimatedPressable onPress={() => console.log("HI")}>
        <Animated.View
          style={rIconStyle}
          className="absolute rounded-lg w-[35] bg-amber-800 h-[35] flex-row justify-center items-center right-[50] top-[3]"
        >
          <EditIcon color="white" size={18} />
        </Animated.View>
      </AnimatedPressable>
      <PanGestureHandler
        onGestureEvent={gestureHandler}
        simultaneousHandlers={simultaneousHandler}
      >
        <Animated.View
          style={animatedStyles}
          className="border border-amber-600 py-1 px-2 bg-white mb-1"
        >
          <Text className="text-sm font-semibold">{folderMetadata.title}</Text>
          <Text className="text-xs">{folderMetadata?.id}</Text>
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
export default MetadataRow;
