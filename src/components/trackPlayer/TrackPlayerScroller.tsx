import { View, Text, ScrollView, FlatList, Image, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import {
  useCurrentPlaylist,
  usePlaybackStore,
  useTrackActions,
  useTracksStore,
} from "@store/store";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { MotiView } from "moti";
import TrackPlayerScrollerRateTimer from "./TrackPlayerScrollerRateTimer";
import TrackPlayerScrollerHistory from "./TrackPlayerScrollerHistory";
import TrackPlayerScrollerDesc from "./TrackPlayerScrollerDesc";
import TrackPlayerScrollerImage from "./TrackPlayerScrollerImage";

const { width, height } = Dimensions.get("window");

const componentArray = [
  {
    component: TrackPlayerScrollerHistory,
    label: "history",
  },
  {
    component: TrackPlayerScrollerImage,
    label: "image",
  },
  {
    component: TrackPlayerScrollerRateTimer,
    label: "Audio Speed",
  },
  {
    component: TrackPlayerScrollerDesc,
    label: "metadata",
  },
];

const COMPONENT_WIDTH = width - 80;

const TrackPlayerScroller = () => {
  const playlist = useCurrentPlaylist();
  const isLoaded = usePlaybackStore((state) => state.playlistLoaded);
  const scrollX = useSharedValue(0);
  const [currIndex, setCurrIndex] = useState(1);
  // Get the Current Track Image
  const currTrackIndex = usePlaybackStore((state) => state.currentTrackIndex);
  const currTrackId = playlist?.trackIds[currTrackIndex];
  const currTrack = useTrackActions().getTrack(currTrackId);

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

  const getItemLayout = (_, index) => {
    return {
      length: COMPONENT_WIDTH,
      offset: COMPONENT_WIDTH * (index - 1),
      index,
    };
  };
  return (
    <Animated.FlatList
      data={componentArray}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={COMPONENT_WIDTH}
      getItemLayout={getItemLayout}
      initialScrollIndex={2}
      style={{
        width: COMPONENT_WIDTH,
        flexGrow: 1,
      }}
      contentContainerStyle={{
        justifyContent: "center",
        alignItems: "center",
        height: COMPONENT_WIDTH,
      }}
      keyExtractor={(_, index) => index.toString()}
      decelerationRate="fast"
      bounces={true}
      onScroll={handleScroll}
      renderItem={({ item, index }) => {
        const Comp = item.component;
        return (
          <View
            style={{
              width: COMPONENT_WIDTH,
            }}
          >
            {isLoaded && (
              <MotiView
                from={{ opacity: 0.5, scale: 0.8 }}
                animate={{
                  opacity: currIndex === index ? 1 : 0.5,
                  scale: currIndex === index ? 1 : 0.7,
                }}
                transition={{ type: "timing", duration: 300 }}
              >
                <Comp playlist={playlist} currentTrack={currTrack} compHeight={COMPONENT_WIDTH} />
              </MotiView>
            )}
          </View>
        );
      }}
    />
  );
};

export default TrackPlayerScroller;
