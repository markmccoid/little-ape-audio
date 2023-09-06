import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
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
import TrackPlayerSettingsRate from "@components/trackPlayer/settings/TrackPlayerSettingsRate";
import { transform } from "lodash";
import { MotiText, MotiView } from "moti";
import { SpeedIcon, TimerSandIcon } from "@components/common/svg/Icons";
import { colors } from "@constants/Colors";

const { width, height } = Dimensions.get("window");
const INDICATOR_WIDTH = 25;
const INDICATOR_SPACING = 20;

const SampleHorizontalFlatList = () => {
  const flatRef = useRef<FlatList>();
  const flatLabelRef = useAnimatedRef<FlatList>();

  const [flIndex, setFLIndex] = useState(0);
  const flSharedIndex = useSharedValue(0);
  const scrollX = useSharedValue(0);

  //-- COMPONENT ARRAY --------------
  type ComponentArray = {
    component: React.JSX.Element[];
    icon: React.JSX.Element[];
    label: string[];
  };

  const componentArray = [
    {
      component: <TrackPlayerSettingsRate />,
      icon: SpeedIcon,
      label: "Audio Speed",
    },
  ];
  const components = [
    <TrackPlayerSettingsRate />,
    <View style={{ width: width - 20, marginHorizontal: 10, borderWidth: 1 }}>
      <Text>This is the second component.</Text>
    </View>,
    <TrackPlayerSettingsRate />,
    <TrackPlayerSettingsRate />,
  ];
  //-- LABEL ARRAY --------------
  const compLabels = ["Audio Speed", "Comp 2", "Speed 3", "The Matrix"];
  const compIcons = [SpeedIcon, TimerSandIcon, SpeedIcon, TimerSandIcon];
  // const compIcons = [
  //   (color) => <SpeedIcon color={color} />,
  //   (color) => <TimerSandIcon color={color} />,
  //   (color) => <SpeedIcon color={color} />,
  //   (color) => <TimerSandIcon color={color} />,
  // ];
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

  //~ Animated Styles
  const INDICATORS_CENTER =
    width / 2 - ((INDICATOR_WIDTH + INDICATOR_SPACING) * components.length) / 2;

  const animatedStyles = useAnimatedStyle(() => {
    const dotPos = interpolate(scrollX.value / width, [0, 1], [0, 45], {
      // const dotPos = interpolate(scrollX.value, [0, width], [-78, -33], {
      // extrapolateRight: Extrapolation.CLAMP,
    });
    // console.log("DOT", dotPos, scrollX.value / width);
    return {
      transform: [{ translateX: dotPos }],
    };
  });

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
        scale = interpolate(
          scrollX.value / width,
          [index - 1, index],
          [SMALL_SCALE, FINAL_SCALE]
        );
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
        {compIcons.map((El, index) => {
          let color = colors.amber950;
          if (index === flIndex) {
            color = colors.amber600;
          }
          return (
            <TouchableOpacity
              key={index}
              onPress={() => onIndicatorPress(index)}
              className="mr-[20]"
            >
              <MotiView
                from={{ opacity: 0.4 }}
                animate={{ opacity: index === flIndex ? 1 : 0.4 }}
              >
                {/* {el(color)} */}
                <El color={color} />
              </MotiView>
            </TouchableOpacity>
          );
        })}
        {/* MOVING INDICATOR */}
        <Animated.View
          className="absolute h-[5] bg-amber-600 z-20"
          style={[
            animatedStyles,
            { width: INDICATOR_WIDTH, top: INDICATOR_WIDTH },
          ]}
        />
      </View>

      <Animated.FlatList
        ref={flatLabelRef}
        data={compLabels}
        horizontal
        style={{ width }}
        scrollEnabled={false}
        snapToInterval={width}
        keyExtractor={(_, index) => index.toString()}
        decelerationRate="fast"
        // extraData={flIndex}
        renderItem={({ item, index }) => (
          <LabelItem item={item} index={index} />
        )}
      />
      <Animated.FlatList
        ref={flatRef}
        data={components}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        keyExtractor={(_, index) => index.toString()}
        decelerationRate="fast"
        onScroll={handleScroll}
        renderItem={({ item, index }) => {
          return item;
        }}
      />
    </View>
  );
};

export default SampleHorizontalFlatList;
