import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { usePlaybackStore } from "../../store/store";
import { formatSeconds } from "../../utils/formatUtils";
import { useProgress } from "react-native-track-player";

const TrackList = () => {
  const queue = usePlaybackStore((state) => state.trackPlayerQueue);
  const currentTrack = usePlaybackStore((state) => state.currentTrack);
  const playbackActions = usePlaybackStore((state) => state.actions);
  const { position, duration } = useProgress();
  return (
    // <View className="flex flex-col">
    <ScrollView>
      {queue?.map((el, index) => {
        const isCurrentTrack = currentTrack.id === el.id;
        return (
          <TouchableOpacity
            key={el.url}
            onPress={() => playbackActions.goToTrack(index)}
          >
            <View
              key={el.url}
              className={`p-2 border border-amber-500 ${
                currentTrack?.id === el.id ? "bg-amber-200" : "bg-white"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold">{`${(index + 1)
                  .toString()
                  .padStart(2, "0")} - ${el.title}`}</Text>
                <Text className="text-xs">
                  {isCurrentTrack
                    ? formatSeconds(el.duration - position)
                    : formatSeconds(el.duration)}
                </Text>
              </View>
              <Text className="text-xs">{`${el.filename}`}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
    // </View>
  );
};

export default TrackList;
