import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

import TrackPlayerSettingsRate from "./TrackPlayerSettingsRate";
import TrackPlayerSettingsTracks from "./TrackPlayerSettingsTracks";
import {
  usePlaybackStore,
  useTrackActions,
  useTracksStore,
} from "../../../store/store";
import { useEffect, useMemo, useRef, useState } from "react";
import TrackPlayerSettingsBookmarks from "./TrackPlayerSettingsBookmarks";
import { AnimateHeight } from "../../common/animations/AnimateHeight";
import { MotiView } from "moti";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
// const x = require("../../../../assets/littleapeaudio.png");
const { width, height } = Dimensions.get("window");
const COMPONENT_WIDTH = width - 20;
const COMPONENT_PADDING = 10;

const TrackPlayerSettingsContainer = () => {
  const [showTracks, setShowTrack] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showItem, setShowItem] = useState<"bookmarks" | "tracks">("bookmarks");
  const flatRef1 = useRef<FlatList>();
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

  const animatedStyles = useAnimatedStyle(() => {
    const dotPos = interpolate(scrollX.value, [0, width], [-78, -33], {
      // extrapolateRight: Extrapolation.CLAMP,
    });
    console.log("DOT", dotPos, flIndex);
    return {
      transform: [{ translateX: dotPos }],
    };
  });

  // const arrayofComps = [One, Two ]
  return (
    <View className="flex-1 flex-col items-center justify-start">
      <View
        className="h-[150] border"
        // style={{ paddingHorizontal: COMPONENT_PADDING }}
      >
        <View className="flex-row justify-center ">
          {/*  */}
          <Animated.View
            className="absolute w-[25] h-[5] bg-red-600  mt-2 z-10"
            style={[animatedStyles]}
          />
          {components.map((_, index) => (
            <View
              key={index}
              className="w-[25] h-[5] bg-blue-600 mr-[20] mt-2 "
            />
          ))}
        </View>
        <Animated.FlatList
          ref={flatRef1}
          data={components}
          horizontal
          snapToInterval={width}
          decelerationRate="fast"
          onScroll={handleScroll}
          renderItem={({ item, index }) => {
            return item;
          }}
        />
        {/* <TrackPlayerSettingsRate /> */}
        {/* <TouchableOpacity onPress={() => setIndex((prev) => prev + 1)}>
          <Text>Next</Text>
        </TouchableOpacity> */}
      </View>
      {/* TRACKS and BOOKMARKS Buttons */}
      <View className="flex-row justify-between w-full mt-3 mb-2 pr-4">
        <TouchableOpacity onPress={() => setShowItem("bookmarks")}>
          <Text
            className={`text-lg ml-2 font-semibold ${
              showItem === "bookmarks" ? "text-amber-600 font-bold" : ""
            }`}
          >
            Bookmarks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowItem("tracks")}>
          <Text
            className={`text-lg ml-2 font-bold ${
              showItem === "tracks" ? "text-amber-600 font-bold" : ""
            }`}
          >
            Tracks
          </Text>
        </TouchableOpacity>
      </View>

      {showItem === "tracks" && (
        <MotiView
          key="a"
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 500,
          }}
          className=""
          style={{ flex: 1, width: "100%" }}
        >
          <TrackPlayerSettingsTracks />
        </MotiView>
      )}

      {showItem === "bookmarks" && (
        <MotiView
          key="b"
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 500,
          }}
          className="w-full"
        >
          <TrackPlayerSettingsBookmarks />
        </MotiView>
      )}
    </View>
  );
};

export default TrackPlayerSettingsContainer;
