import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Button,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { usePlaybackStore } from "../../store/store";
import { formatSeconds } from "../../utils/formatUtils";
import TrackPlayer, { useProgress } from "react-native-track-player";
import { colors } from "../../constants/Colors";
import { ApeTrack } from "../../store/types";

const { width, height } = Dimensions.get("window");
const TrackList = () => {
  const queue = usePlaybackStore((state) => state.trackPlayerQueue);
  const currentTrack = usePlaybackStore((state) => state.currentTrack);
  const isPlaylistLoaded = usePlaybackStore((state) => state.playlistLoaded);
  const currentTrackIndex = usePlaybackStore(
    (state) => state.currentTrackIndex
  );
  const playbackActions = usePlaybackStore((state) => state.actions);
  const { position, duration } = useProgress();
  const scrollViewRef = useRef(null);

  // Scroll to the active track
  const scrollToRow = (rowIndex) => {
    if (!scrollViewRef.current) return;
    scrollViewRef.current.scrollTo({
      x: 0,
      y: rowIndex * 55 - 1, // Assuming each row has a height of 55 and 1 border
      animated: true,
    });
  };

  useEffect(() => {
    scrollToRow(currentTrackIndex);
  }, [currentTrackIndex, scrollViewRef.current]);

  if (!isPlaylistLoaded) {
    return null;
  }
  return (
    <View
      className="flex-1"
      style={{ borderWidth: 1, borderColor: colors.amber500 }}
    >
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, marginBottom: 40, paddingBottom: 10 }}
        contentContainerStyle={{ paddingBottom: 2 }}
        // className="border border-amber-600"
      >
        {queue?.map((el, index) => {
          const isCurrentTrack = currentTrack.id === el.id;
          return (
            <TouchableOpacity
              key={el.id}
              onPress={() => {
                if (!isCurrentTrack) {
                  playbackActions.goToTrack(index);
                }
              }}
              className=""
            >
              <View
                key={el.url}
                className={`p-2 ${
                  index === 0 ? "border" : "border-b"
                } border-amber-500 h-[55] ${
                  currentTrack?.id === el.id ? "bg-amber-200" : "bg-white"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-sm font-semibold flex-1 flex-grow"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    // style={{ width: width / 1.2 }}
                  >{`${(index + 1).toString().padStart(2, "0")} - ${
                    el.title
                  }`}</Text>
                  <View style={{ width: 75 }} className="flex-row justify-end">
                    <Text className="text-xs">
                      {isCurrentTrack
                        ? formatSeconds(el.duration - position)
                        : formatSeconds(el.duration)}
                    </Text>
                  </View>
                </View>
                <Text
                  className="text-xs"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >{`${el.filename}`}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default TrackList;
