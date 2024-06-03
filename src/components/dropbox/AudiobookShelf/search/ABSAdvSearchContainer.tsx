import { View, Text, Pressable, ScrollView } from "react-native";
import React from "react";
import { useFocusEffect } from "expo-router";
import ABSAdvSearchGenres from "./ABSAdvSearchGenres";
import ABSAdvSearchTags from "./ABSAdvSearchTags";
import HiddenContainer from "@components/common/hiddenContainer/HiddenContainer";
import { useABSStore } from "@store/store-abs";

const buildExtraInfo = (selectedItems: string[]) => {
  if (!selectedItems || selectedItems?.length === 0) return "";

  return `${selectedItems[0]} ${
    selectedItems?.length > 1 ? `+ ${selectedItems.length - 1} more` : ""
  } `;
};
const ABSAdvSearchContainer = () => {
  useFocusEffect(() => {
    console.log("Focuse Effect - ABSAdvSearchContianer.tsx");
    return () => console.log("UNMOUNT focus effect-ABSAdvSearchContianer");
  });
  const searchObject = useABSStore((state) => state.searchObject);

  return (
    <View>
      <View className="p-3 border-b border-amber-900 mb-2 flex-row justify-center bg-amber-500">
        <Text className="text-lg font-bold text-amber-950">Advanced Search</Text>
      </View>
      <ScrollView className="flex-col ">
        <HiddenContainer
          title="Genres"
          style={{ height: 200 }}
          titleInfo={buildExtraInfo(searchObject?.genres)}
        >
          <ABSAdvSearchGenres />
        </HiddenContainer>
        <HiddenContainer
          title="Tags"
          style={{ height: 200 }}
          titleInfo={buildExtraInfo(searchObject?.tags)}
        >
          <ABSAdvSearchTags />
        </HiddenContainer>
      </ScrollView>
    </View>
  );
};

export default ABSAdvSearchContainer;
