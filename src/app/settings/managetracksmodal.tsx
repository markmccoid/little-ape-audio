import { View, Text, ScrollView } from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams, useSearchParams } from "expo-router";
import { useTracksStore } from "@store/store";
import { AudioTrack } from "@store/types";
import * as FileSystem from "expo-file-system";

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
    <View className="flex-1">
      <View className="p-1 border-b border-b-amber-800">
        <Text className="font-semibold">Track Id</Text>
        <Text>{currTrack.id}</Text>
      </View>
      <View className="p-1 border-b border-b-amber-800">
        <Text className="font-semibold">File URI</Text>
        <Text>{`${FileSystem.documentDirectory}${currTrack.fileURI}`}</Text>
      </View>
      <View className="p-1 border-b border-b-amber-800">
        <Text className="font-semibold">Track Title</Text>
        <Text>{currTrack.metadata.title}</Text>
      </View>
      <View className="p-1 border-b border-b-amber-800">
        <Text className="font-semibold">Artist - Album</Text>
        <Text>{`${currTrack.metadata.artist} - ${currTrack.metadata.album}`}</Text>
      </View>
      <View className="p-1 border-b border-b-amber-800">
        <Text className="font-semibold">Year - Genre</Text>
        <Text>{`${currTrack.metadata.year} - ${currTrack.metadata.genre}`}</Text>
      </View>
      <View className="p-1 border-b border-b-amber-800">
        <Text className="font-semibold">Duration Seconds</Text>
        <Text>{`${currTrack.metadata.durationSeconds}`}</Text>
      </View>

      <ScrollView className="mb-4 p-1 border-b border-b-amber-800">
        {currTrack.metadata?.chapters && (
          <Text className="font-semibold text-amber-700">Chapters</Text>
        )}
        {currTrack.metadata?.chapters &&
          currTrack.metadata?.chapters.map((el, index) => {
            return (
              <View
                key={el.startSeconds}
                className="flex-col mb-1 border-b border-l border-red-700 "
              >
                <View className="flex-row flex-wrap mx-2">
                  <Text className="pr-2">{index + 1}</Text>
                  <Text className="pr-2 flex-1" numberOfLines={1} lineBreakMode="tail">
                    {el.title}
                  </Text>
                </View>
                <View className="flex-row flex-wrap mx-2">
                  <Text className="pl-2 font-medium">Start / End In Seconds</Text>
                  <Text className="pl-5 pr-2">{el.startSeconds}</Text>
                  <Text className="pr-2">{el.endSeconds}</Text>
                </View>
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
};

export default managetracksmodal;
