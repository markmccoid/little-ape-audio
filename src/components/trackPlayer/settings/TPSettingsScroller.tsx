import { View, Text, Dimensions, TouchableOpacity, FlatList } from "react-native";
import React, { useCallback, useRef, useState } from "react";
import TrackPlayerSettingsRate from "./TrackPlayerSettingsRate";
import TrackPlayerSettingsSleepTimer from "./TrackPlayerSettingsSleepTimer";
import TPImagePicker from "./TPImagePicker";
import { ImageIcon, SpeedIcon, TimerSandIcon } from "@components/common/svg/Icons";
import Animated, {
  interpolate,
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { MotiView } from "moti";
import { colors } from "@constants/Colors";
import { usePlaybackStore } from "@store/store";
import usePlaylistColors from "hooks/usePlaylistColors";

//-- COMPONENT ARRAY holds the info for the components --------------
//-- used in scroller
type ComponentArray = {
  component: React.JSX.Element[];
  icon: React.JSX.Element[];
  label: string[];
};

const componentArray = [
  {
    component: TrackPlayerSettingsRate,
    icon: SpeedIcon,
    label: "Audio Speed",
  },
  {
    component: TrackPlayerSettingsSleepTimer,
    icon: TimerSandIcon,
    label: "Sleep Timer",
  },
  {
    component: TPImagePicker,
    icon: ImageIcon,
    label: "Image Picker",
  },
];

//## Constants
const { width, height } = Dimensions.get("window");
const INDICATOR_WIDTH = 25;
const INDICATOR_SPACING = 20;
const INDICATORS_CENTER =
  width / 2 - ((INDICATOR_WIDTH + INDICATOR_SPACING) * componentArray.length) / 2;

const TPSettingsScroller = () => {
  const flatRef = useRef<FlatList>();
  const flatLabelRef = useAnimatedRef<FlatList>();
  const [flIndex, setFLIndex] = useState(0);
  const playlistColors = usePlaylistColors();

  const currPlaylistId = usePlaybackStore((state) => state.currentPlaylistId);

  const scrollX = useSharedValue(0);

  //~ Handle the scrolling --------------
  const handleScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
      scrollTo(flatLabelRef, scrollX.value, 0, false);
    },
    onEndDrag: (e) => {
      runOnJS(setFLIndex)(e.targetContentOffset.x / width);
    },
  });

  //~ Animated Styles -------------------
  const animatedStyles = useAnimatedStyle(() => {
    const dotPos = interpolate(scrollX.value / width, [0, 1], [0, 45]);
    return {
      transform: [{ translateX: dotPos }],
    };
  });
  // onPress in Icons
  const onIndicatorPress = (idx) => {
    flatRef?.current.scrollToIndex({ animated: true, index: idx });
    setFLIndex(idx);
  };

  //!! RENDER ITEMS LABEL
  const LabelItem = useCallback(({ item, index }) => {
    const animStyle = useAnimatedStyle(() => {
      const scrollingIndex = scrollX.value / width;
      const activeIndex = Math.floor(scrollingIndex);
      const nextIndex = Math.floor(scrollingIndex) + 1;
      const isScrolling = scrollingIndex !== activeIndex;

      const FINAL_SCALE = 1;
      const SMALL_SCALE = 0.5;
      const OPACITY_START = 0.2;
      const OPACITY_END = 1;

      /**
       * if we are on the activeIndex and not scrolling then scale = FINAL_SCALE
       * if we are on the activeIndex and scrolling the make smaller
       * if we are on the nextIndex and scrolling then make larger
       * if we are > then the next index make scale SMALL_SCALE
       */
      let scale;
      let opacity;
      if (activeIndex === index && !isScrolling) {
        scale = FINAL_SCALE;
        opacity = OPACITY_END;
      } else if (activeIndex === index && isScrolling) {
        scale = interpolate(
          scrollX.value / width,
          [0 + index, 1 + index],
          [FINAL_SCALE, SMALL_SCALE]
        );
        opacity = interpolate(
          scrollX.value / width,
          [0 + index, 1 + index],
          [OPACITY_END, OPACITY_START]
        );
      } else if (nextIndex === index && isScrolling) {
        scale = interpolate(scrollX.value / width, [index - 1, index], [SMALL_SCALE, FINAL_SCALE]);
        opacity = interpolate(
          scrollX.value / width,
          [index - 1, index],
          [OPACITY_START, OPACITY_END]
        );
      } else {
        scale = SMALL_SCALE;
        opacity = OPACITY_START;
      }
      return {
        transform: [{ scale: withSpring(scale) }],
        opacity: withTiming(opacity),
      };
    });
    return (
      <Animated.View
        style={[
          animStyle,
          {
            width: width - 10,
            marginLeft: 10,
          },
        ]}
        key={index}
      >
        <Text
          className="font-bold text-lg"
          style={{
            transform: [{ translateX: 10 }],
            color: playlistColors.gradientTopText,
          }}
        >
          {item}
        </Text>
      </Animated.View>
    );
  }, []);

  return (
    <View className="flex-col">
      <View
        className="flex-row mt-2 h-[35]"
        style={{ transform: [{ translateX: INDICATORS_CENTER }] }}
      >
        {componentArray.map((el, index) => {
          let color = playlistColors.gradientTopText; // colors.amber950;
          if (index === flIndex) {
            color = playlistColors.gradientTopText; // colors.amber600;
          }
          return (
            <TouchableOpacity
              key={index}
              onPress={() => onIndicatorPress(index)}
              className="mr-[20]"
            >
              <MotiView from={{ opacity: 0.4 }} animate={{ opacity: index === flIndex ? 1 : 0.4 }}>
                {/* {el(color)} */}
                <el.icon color={color} />
              </MotiView>
            </TouchableOpacity>
          );
        })}
        {/* MOVING INDICATOR */}
        <Animated.View
          className="absolute h-[5]  z-20"
          style={[
            animatedStyles,
            {
              width: INDICATOR_WIDTH,
              top: INDICATOR_WIDTH,
              backgroundColor: playlistColors.gradientTopText,
            },
          ]}
        />
      </View>

      <View>
        <Animated.FlatList
          ref={flatLabelRef}
          data={componentArray.map((el) => el.label)}
          horizontal
          style={{ width }}
          // contentContainerStyle={{ borderWidth: 1 }}
          scrollEnabled={false}
          snapToInterval={width}
          keyExtractor={(_, index) => index.toString()}
          decelerationRate="fast"
          // extraData={flIndex}
          renderItem={({ item, index }) => (
            <View className="flex ">
              <LabelItem item={item} index={index} />
            </View>
          )}
        />
      </View>
      <View>
        <Animated.FlatList
          ref={flatRef}
          data={componentArray}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={width}
          style={{ width }}
          keyExtractor={(_, index) => index.toString()}
          decelerationRate="fast"
          onScroll={handleScroll}
          renderItem={({ item, index }) => {
            const Comp = item.component;
            return (
              <View style={{ width }}>
                {index !== 2 && flIndex === index && <Comp />}
                {index === 2 && flIndex === index && (
                  <MotiView
                    from={{ opacity: 0, height: 5 }}
                    animate={{ opacity: 1, height: 135 }}
                    // exit={{ height: 0 }}
                    style={{ marginHorizontal: 8 }}
                  >
                    <Comp currPlaylistId={currPlaylistId} />
                  </MotiView>
                )}
              </View>
            );
          }}
        />
      </View>
    </View>
  );
};

export default TPSettingsScroller;
