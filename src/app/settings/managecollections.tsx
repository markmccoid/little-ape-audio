import { View, Text } from "react-native";
import React from "react";
import LAABColorPicker from "@components/common/LAABColorPicker";
import { useLocalSearchParams } from "expo-router";
import PlaylistCollectionSetup from "@components/playlists/edit/PlaylistCollectionSetup";

const managecollections = () => {
  // const params = useLocalSearchParams();
  // console.log("PARAMS", params);

  return (
    <View className="flex-1">
      <PlaylistCollectionSetup />
      {/* <LAABColorPicker /> */}
    </View>
  );
};

export default managecollections;
