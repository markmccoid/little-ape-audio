import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import TrackPlayerSettingsRate from "./settings/TrackPlayerSettingsRate";
import TrackPlayerSettingsSleepTimer from "./settings/TrackPlayerSettingsSleepTimer";
import { useCurrentPlaylist } from "@store/store";
import TrackPlayerScrollerRateTimer from "./TrackPlayerScrollerRateTimer";
import Animated, {
  FadeIn,
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { MotiView } from "moti";

const { width, height } = Dimensions.get("window");

const componentArray = [
  {
    component: ({ imageURI }) => (
      <Image
        source={{ uri: imageURI }}
        style={{
          width: width / 1.35,
          height: width / 1.35,
          // width: width - 100, //width / 1.35,
          // height: width - 100, // width / 1.35,
          resizeMode: "stretch",
          alignSelf: "center",
        }}
      />
    ),
    label: "",
  },
  {
    component: TrackPlayerScrollerRateTimer,
    label: "Audio Speed",
  },
];

const COMPONENT_WIDTH = width - 80;

const TrackPlayerScoller = () => {
  const playlist = useCurrentPlaylist();
  const scrollX = useSharedValue(0);
  const [currIndex, setCurrIndex] = useState(0);

  //~ Handle the scrolling --------------
  const handleScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
      // scrollTo(flatLabelRef, scrollX.value, 0, false);
    },
    onEndDrag: (e) => {
      runOnJS(setCurrIndex)(e.targetContentOffset.x / COMPONENT_WIDTH);
    },
  });

  return (
    <Animated.FlatList
      data={componentArray}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={COMPONENT_WIDTH}
      style={{
        width: COMPONENT_WIDTH,
        flexGrow: 1,
      }}
      contentContainerStyle={{
        justifyContent: "center",
        alignItems: "center",
      }}
      keyExtractor={(_, index) => index.toString()}
      decelerationRate="fast"
      bounces={false}
      onScroll={handleScroll}
      renderItem={({ item, index }) => {
        const Comp = item.component;
        return (
          <View style={{ width: COMPONENT_WIDTH }}>
            {index === 0 && (
              <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: currIndex === index ? 1 : 0.4,
                  scale: currIndex === index ? 1 : 0.7,
                }}
                transition={{ type: "timing", duration: 500 }}
              >
                <Comp imageURI={playlist?.imageURI} />
              </MotiView>
            )}
            {index !== 0 && (
              <MotiView
                from={{ opacity: 0.5, scale: 0.8 }}
                animate={{
                  opacity: currIndex === index ? 1 : 0.5,
                  scale: currIndex === index ? 1 : 0.5,
                }}
                transition={{ type: "timing", duration: 300 }}
              >
                <Comp />
              </MotiView>
            )}
            {/* {index !== 2 && flIndex === index && <Comp />}
          {index === 2 && flIndex === index && (
            <MotiView
              from={{ opacity: 0, height: 5 }}
              animate={{ opacity: 1, height: 135 }}
              // exit={{ height: 0 }}
              style={{ marginHorizontal: 8 }}
            >
              <Comp currPlaylistId={currPlaylistId} />
            </MotiView>
          )} */}
          </View>
        );
      }}
    />
  );
};

export default TrackPlayerScoller;
