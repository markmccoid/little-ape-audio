import { View, Text, Image, ScrollView, TouchableOpacity, Button } from "react-native";
import React, { useState } from "react";
import { usePlaylists, useTracksStore } from "@store/store";

type Props = {
  trackId: string;
  selectedId: string;
  setSelectedId: (val: string) => void;
  isMoving: boolean;
  toggleIsMoving: () => void;
};

const MoveToExisting = ({
  trackId,
  selectedId,
  setSelectedId,
  isMoving,
  toggleIsMoving,
}: Props) => {
  const playlists = usePlaylists();

  return (
    <View>
      <Button title={isMoving ? "Move" : "Copy"} onPress={toggleIsMoving} />
      <ScrollView>
        {playlists?.map((playlist) => {
          const isSelected = selectedId === playlist.id;
          return (
            <TouchableOpacity
              onPress={() => setSelectedId(playlist.id)}
              className={`flex-row mx-1 rounded-md mb-1 ${
                isSelected ? "border border-red-700" : "border border-black"
              }`}
              key={playlist.id}
            >
              <Image source={{ uri: playlist.imageURI }} className="w-[75] h-[75]" />
              <View className="flex-col justify-end ml-2 flex-1">
                {isSelected && (
                  <View className="border bg-red-500 py-1 mb-2 items-center px-2 rounded-md mr-2">
                    <Text className="text-white font-semibold">SELECTED</Text>
                  </View>
                )}
                <Text>name: {playlist.name}</Text>
                <Text>author: {playlist.author}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default MoveToExisting;
