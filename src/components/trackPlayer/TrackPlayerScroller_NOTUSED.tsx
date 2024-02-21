import { View, Text, ScrollView, FlatList, Image, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import {
  useCurrentPlaylist,
  usePlaybackStore,
  useTrackActions,
  useTracksStore,
} from "@store/store";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { MotiView } from "moti";
import TrackPlayerScrollerRateTimer from "./TrackPlayerScrollerRateTimer";
import TrackPlayerScrollerHistory from "./TrackPlayerScrollerHistory";
import PagerView from "react-native-pager-view";

const { width, height } = Dimensions.get("window");

const componentArray = [
  {
    component: TrackPlayerScrollerHistory,
    label: "history",
  },
  {
    component: ({ imageURI }) => (
      <View
        style={{
          // flex: 1,
          backgroundColor: "white",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 2,
          elevation: 1,
          // width: width / 1.35,
          // height: width / 1.35,
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
    label: "image",
  },
  {
    component: () => {
      const currTrack = usePlaybackStore((state) => state.currentTrack);
      const track = useTracksStore().actions.getTrack(currTrack.id);
      // console.log(currTrack.id);
      return (
        <View className="">
          <Text>Downloaded: {track?.externalMetadata?.dateDownloaded}</Text>
          <Text>From: {track?.externalMetadata?.audioSource}</Text>
          <Text>Tracks: {track?.externalMetadata?.audioFileCount}</Text>
          <Text>{track?.externalMetadata?.description}</Text>
        </View>
      );
    },
    label: "metadata",
  },
  {
    component: TrackPlayerScrollerRateTimer,
    label: "Audio Speed",
  },
];

const COMPONENT_WIDTH = width - 80;

const TrackPlayerScroller = () => {
  const [pagerIndex, setPagerIndex] = useState(1);
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
  console.log("pagerIndex", pagerIndex);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [pagerIndex - 1, pagerIndex, pagerIndex + 1],
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );
    // const opacity = interpolate(scrollX.value, [0, 1, 0, 1], [0.5, 1, 0.5, 1]);
    return {
      opacity,
      transform: [{ scale: opacity }],
    };
  });

  return (
    <View style={{ flexGrow: 1 }}>
      <PagerView
        style={{ height: COMPONENT_WIDTH }}
        orientation="horizontal"
        initialPage={1}
        overdrag={true}
        pageMargin={10}
        onPageScroll={(e) => {
          setPagerIndex(e.nativeEvent.position + e.nativeEvent.offset);
          // console.log("onPageScroll", e.nativeEvent.offset + e.nativeEvent.position);
          scrollX.value = e.nativeEvent.offset + e.nativeEvent.position;
        }}
        // onPageScrollStateChanged={(e) => console.log(e.nativeEvent.pageScrollState)}
        // onPageSelected={(e) => console.log("onPageSel", e.nativeEvent.position)}
      >
        {componentArray.map((el, compIndex) => {
          console.log("compIndex", compIndex, pagerIndex);
          const Comp = el.component;
          if (el.label === "image") {
            const image =
              playlist?.overrideTrackImage || !currTrack?.metadata?.pictureURI
                ? playlist?.imageURI
                : currTrack?.metadata?.pictureURI;
            return (
              <MotiView
                key={el.label}
                from={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: pagerIndex ? 1 : 0.4,
                  scale: pagerIndex ? 1 : 0.7,
                }}
                transition={{ type: "timing", duration: 300 }}
              >
                {/* <Animated.View style={animatedStyle}> */}
                <Comp imageURI={image} />
                {/* </Animated.View> */}
              </MotiView>
            );
          }
          return (
            <MotiView
              key={el.label}
              from={{ opacity: 0.5, scale: 0.8 }}
              animate={{
                opacity: compIndex >= pagerIndex ? 1 : 0.5,
                scale: compIndex >= pagerIndex ? 1 : 0.7,
              }}
              transition={{ type: "timing", duration: 300 }}
            >
              {/* <Animated.View style={animatedStyle}> */}
              <Comp />
              {/* </Animated.View> */}
            </MotiView>
          );
        })}
      </PagerView>
    </View>
  );
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

export default TrackPlayerScroller;
