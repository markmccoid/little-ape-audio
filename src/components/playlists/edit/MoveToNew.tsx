import { View, Text, TextInput, Button, Image, StyleSheet } from "react-native";
import React, { useReducer, useState } from "react";
import { useTrackActions } from "@store/store";

type Props = {
  trackId: string;
  newPLName: string;
  setNewPLName: (val: string) => void;
  isMoving: boolean;
  toggleIsMoving: () => void;
};
const MoveToNew = ({ trackId, newPLName, setNewPLName, isMoving, toggleIsMoving }: Props) => {
  const trackActions = useTrackActions();

  const trackInfo = trackActions.getTrack(trackId);
  return (
    <View>
      <View className="m-2 flex-row items-center">
        <Text className="font-semibold mr-2">Playlist Name</Text>
        <TextInput
          className="border p-2 w-[50%] rounded-lg bg-white"
          value={newPLName}
          onChangeText={(val) => setNewPLName(val)}
        />
      </View>
      <Button title={isMoving ? "Move" : "Copy"} onPress={toggleIsMoving} />
      <Text className="mt-2 mx-2 font-semibold">Track Being {isMoving ? "Moved" : "Copied"}</Text>
      <View className="flex-row border rounded-lg mx-2 my-1">
        <Image
          source={{ uri: trackInfo.metadata?.pictureURI }}
          className="w-[50] h-[50]"
          style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: "black" }}
        />
        <View className="flex-col justify-center flex-1 my-1 bg-white">
          <Text numberOfLines={1} ellipsizeMode="tail" className="mx-2 flex-1">
            {trackInfo.metadata?.title}
          </Text>
          <Text className="mx-2">{trackInfo.metadata?.artist}</Text>
        </View>
      </View>
    </View>
  );
};

export default MoveToNew;
