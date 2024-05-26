import { StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

export type AnimateHeightProps = {
  children?: React.ReactNode;
  /**
   * If `true`, the height will automatically animate to 0. Default: `false`.
   */
  hide?: boolean;
  style: ViewStyle;
  onHeightDidAnimate?: (height: number) => void;
  initialHeight?: number;
  // max height that will be animated to.
  maxHeight?: number;
};

const transition = { duration: 300 } as const;

function AnimateHeight({
  children,
  hide = false,
  style,
  onHeightDidAnimate,
  initialHeight = 0,
  maxHeight,
}: AnimateHeightProps) {
  const measuredHeight = useSharedValue(initialHeight);

  const childStyle = useAnimatedStyle(
    () => ({
      opacity: withTiming(!measuredHeight.value || hide ? 0 : 1, transition),
    }),
    [hide, measuredHeight]
  );

  const containerStyle = useAnimatedStyle(() => {
    if (measuredHeight.value > maxHeight) {
      measuredHeight.value = maxHeight;
    }
    return {
      height: withTiming(hide ? 0 : measuredHeight.value || 0, transition, () => {
        if (onHeightDidAnimate) {
          runOnJS(onHeightDidAnimate)(measuredHeight.value);
        }
      }),
    };
  }, [hide, measuredHeight]);

  return (
    <Animated.View style={[styles.hidden, style, containerStyle]}>
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.autoBottom, childStyle]}
        onLayout={({ nativeEvent }) => {
          measuredHeight.value = Math.ceil(nativeEvent.layout.height);
        }}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  autoBottom: {
    bottom: "auto",
  },
  hidden: {
    overflow: "hidden",
  },
});

export { AnimateHeight };
