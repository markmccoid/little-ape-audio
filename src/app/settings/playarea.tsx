import { View, Text, FlatList, Dimensions } from "react-native";
import React, { useRef, useState } from "react";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import TrackPlayerSettingsRate from "@components/trackPlayer/settings/TrackPlayerSettingsRate";
import { transform } from "lodash";

const { width, height } = Dimensions.get("window");
const INDICATOR_WIDTH = 25;
const INDICATOR_SPACING = 20;

const playarea = () => {
  const flatRef = useRef<FlatList>();
  const [flIndex, setFLIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const components = [
    <TrackPlayerSettingsRate />,
    <View style={{ width: width - 20, marginHorizontal: 10, borderWidth: 1 }}>
      <Text>This is the second component.</Text>
    </View>,
    <TrackPlayerSettingsRate />,
    <TrackPlayerSettingsRate />,
  ];

  const handleScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const INDICATORS_CENTER =
    width / 2 - ((INDICATOR_WIDTH + INDICATOR_SPACING) * components.length) / 2;
  const animatedStyles = useAnimatedStyle(() => {
    const dotPos = interpolate(scrollX.value / width, [0, 1], [0, 45], {
      // const dotPos = interpolate(scrollX.value, [0, width], [-78, -33], {
      // extrapolateRight: Extrapolation.CLAMP,
    });
    console.log("DOT", dotPos, scrollX.value / width);
    return {
      transform: [{ translateX: dotPos }],
    };
  });

  return (
    <View>
      <Text>playarea</Text>
      <View
        className="flex-row"
        style={{ transform: [{ translateX: INDICATORS_CENTER }] }}
      >
        {/*  */}
        <Animated.View
          className="absolute h-[5] bg-red-600  mt-2 z-20"
          style={[animatedStyles, { width: INDICATOR_WIDTH }]}
        />
        {components.map((_, index) => (
          <View
            key={index}
            className="h-[5] bg-blue-600 mt-2"
            style={{ width: INDICATOR_WIDTH, marginRight: INDICATOR_SPACING }}
          />
        ))}
      </View>
      <View className="flex-row justify-center border">
        <Animated.View>
          <Text>Audio Speed</Text>
        </Animated.View>
        <Animated.View>
          <Text>Next</Text>
        </Animated.View>
      </View>
      <Animated.FlatList
        ref={flatRef}
        data={components}
        horizontal
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

export default playarea;
