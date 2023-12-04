import { View, Text, ScrollView, FlatList, Image, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { useCurrentPlaylist, usePlaybackStore, useTrackActions } from "@store/store";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { MotiView } from "moti";
import TrackPlayerScrollerRateTimer from "./TrackPlayerScrollerRateTimer";
import TrackPlayerScrollerComments from "./TrackPlayerScrollerComments";
import { AudioTrack } from "@store/types";

const { width, height } = Dimensions.get("window");

const componentArray = [
  {
    component: TrackPlayerScrollerComments,
    label: "",
  },
  {
    component: ({ imageURI }) => (
      <View
        style={{
          backgroundColor: "white",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 2,
          elevation: 1,
          width: width / 1.35,
          height: width / 1.35,
          borderRadius: 20,
          alignSelf: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={{ uri: imageURI }}
          style={{
            width: width / 1.35,
            height: width / 1.35,
            borderRadius: 20,
            // width: width - 100, //width / 1.35,
            // height: width - 100, // width / 1.35,
            resizeMode: "stretch",
            alignSelf: "center",
          }}
        />
      </View>
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
  const isLoaded = usePlaybackStore((state) => state.playlistLoaded);
  const trackActions = useTrackActions();
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
      bounces={false}
      onScroll={handleScroll}
      renderItem={({ item, index }) => {
        const Comp = item.component;
        const image =
          playlist?.overrideTrackImage || !currTrack?.metadata?.pictureURI
            ? playlist?.imageURI
            : currTrack?.metadata?.pictureURI;
        return (
          <View
            style={{
              width: COMPONENT_WIDTH,
            }}
          >
            {index === 1 && (
              <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: currIndex === index ? 1 : 0.4,
                  scale: currIndex === index ? 1 : 0.7,
                }}
                transition={{ type: "timing", duration: 300 }}
              >
                <Comp imageURI={image} />
                {/* <Comp imageURI={playlist?.imageURI} /> */}
              </MotiView>
            )}
            {index !== 1 && isLoaded && (
              <MotiView
                from={{ opacity: 0.5, scale: 0.8 }}
                animate={{
                  opacity: currIndex === index ? 1 : 0.5,
                  scale: currIndex === index ? 1 : 0.7,
                }}
                transition={{ type: "timing", duration: 300 }}
              >
                <Comp />
              </MotiView>
            )}
          </View>
        );
      }}
    />
  );
};

export default TrackPlayerScoller;
