import { View, Text } from "react-native";
import React from "react";
import { usePlaybackStore } from "../../store/store";

const TrackList = () => {
  const queue = usePlaybackStore((state) => state.trackPlayerQueue);
  const currentTrack = usePlaybackStore((state) => state.currentTrack);
  return (
    <View>
      {queue?.map((el, index) => {
        return (
          <View
            key={el.url}
            className={`p-2 border border-amber-500 ${
              currentTrack?.id === el.id ? "bg-red-300" : "bg-white"
            }`}
          >
            <Text>{`${(index + 1).toString().padStart(2, "0")} - ${
              el.title
            }`}</Text>
          </View>
        );
      })}
    </View>
  );
};

export default TrackList;
