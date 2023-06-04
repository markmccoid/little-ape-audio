import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { usePlaybackStore } from "../../store/store";
import { formatSeconds } from "../../utils/formatUtils";
import { useProgress } from "react-native-track-player";

const { width, height } = Dimensions.get("window");
const TrackList = () => {
  const queue = usePlaybackStore((state) => state.trackPlayerQueue);
  const currentTrack = usePlaybackStore((state) => state.currentTrack);
  const playbackActions = usePlaybackStore((state) => state.actions);
  const { position, duration } = useProgress();
  return (
    <ScrollView
      style={{ flex: 1, marginBottom: 40, paddingBottom: 10 }}
      contentContainerStyle={{ paddingBottom: 2 }}
      // className="border border-amber-600"
    >
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
                numberOfLines={2}
                ellipsizeMode="tail"
              >{`${el.filename}`}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default TrackList;
