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
import TPSettingsScroller from "./TPSettingsScroller";
// const x = require("../../../../assets/littleapeaudio.png");
const { width, height } = Dimensions.get("window");
const COMPONENT_WIDTH = width - 20;
const COMPONENT_PADDING = 10;

const TrackPlayerSettingsContainer = () => {
  const [showItem, setShowItem] = useState<"bookmarks" | "tracks">("bookmarks");

  // const arrayofComps = [One, Two ]
  return (
    <View className="flex-1 flex-col items-center justify-start">
      <View className="flex-row">
        <TPSettingsScroller />
      </View>

      {/* TRACKS and BOOKMARKS Buttons */}
      <View className="flex-1 flex-col items-center justify-start w-full">
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
            className="px-2 flex-1"
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
            className="w-full px-2 flex-1"
          >
            <TrackPlayerSettingsBookmarks />
          </MotiView>
        )}
      </View>
    </View>
  );
};

export default TrackPlayerSettingsContainer;
