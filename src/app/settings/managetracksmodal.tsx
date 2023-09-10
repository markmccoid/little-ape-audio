import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams, useSearchParams } from "expo-router";
import { useTracksStore } from "@store/store";
import { AudioTrack } from "@store/types";

const managetracksmodal = () => {
  const params = useLocalSearchParams();
  const tracks = useTracksStore((state) => state.tracks);
  const [currTrack, setCurrTrack] = React.useState<AudioTrack>();

  //!! NEED TO MAKE clear the difference in docs between
  //!! track.id, track.filename and track.fileURI (This is the actual "ID" used in the playlist.)
  useEffect(() => {
    const track = tracks.find((el) => el.fileURI === params.trackId);
    setCurrTrack(track);
  });
  if (!currTrack) return;
  return (
    <View>
      <Text>{currTrack.id}</Text>
      <Text className="font-semibold">Track Title</Text>
      <Text>{currTrack.metadata.title}</Text>
      <Text className="font-semibold">Chapters</Text>
      {currTrack.metadata?.chapters &&
        currTrack.metadata?.chapters.map((el, index) => {
          return (
            <View
              key={el.startTime}
              className="flex-row flex-wrap mb-1 border-b border-b-amber-800"
            >
              <Text className="pr-2">{index + 1}</Text>
              <Text className="pr-2">{el.description}</Text>
              <Text className="pr-2">{el.startTime}</Text>
              <Text className="pr-2">{el.endTime}</Text>
            </View>
          );
        })}
    </View>
  );
};

export default managetracksmodal;
