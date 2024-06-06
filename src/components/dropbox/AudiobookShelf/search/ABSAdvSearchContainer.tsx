import { View, Text, Pressable, ScrollView } from "react-native";
import React from "react";
import { useFocusEffect } from "expo-router";
import ABSAdvSearchGenres from "./ABSAdvSearchGenres";
import ABSAdvSearchTags from "./ABSAdvSearchTags";
import HiddenContainer from "@components/common/hiddenContainer/HiddenContainer";
import { useABSStore } from "@store/store-abs";
import ABSResultSearchInputText from "./ABSSearchInputText";
import { useGetAllABSBooks } from "@store/data/absHooks";

const buildExtraInfo = (selectedItems: string[]) => {
  if (!selectedItems || selectedItems?.length === 0) return "";

  return `${selectedItems[0]} ${
    selectedItems?.length > 1 ? `+ ${selectedItems.length - 1} more` : ""
  } `;
};
const ABSAdvSearchContainer = () => {
  useFocusEffect(() => {
    // console.log("Focuse Effect - ABSAdvSearchContianer.tsx");
    // return () => console.log("UNMOUNT focus effect-ABSAdvSearchContianer");
  });
  const searchObject = useABSStore((state) => state.searchObject);
  const { selectedBookCount } = useGetAllABSBooks();
  const updateSearchObject = useABSStore((state) => state.actions.updateSearchObject);
  const updateDescription = (description: string) => {
    updateSearchObject({ description });
  };
  return (
    <View className="bg-amber-50 h-full">
      <View className="p-3 border-b border-amber-900 mb-2 flex-row justify-center bg-amber-500">
        <Text className="text-lg font-bold text-amber-950">Advanced Search</Text>
      </View>
      <View className="flex-row justify-center">
        <Text className="text-base font-semibold">
          Matched {selectedBookCount === -1 ? 0 : selectedBookCount} Books
        </Text>
      </View>
      <ScrollView className="flex-col bg-amber-50" contentContainerStyle={{}}>
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
        {/* <View className="flex-col mx-2 mt-2 flex-1">
          <Text className="text-base font-semibold">Description</Text>
        </View> */}
        <View className="flex-row p-2">
          <ABSResultSearchInputText
            updateSearch={updateDescription}
            label="Description"
            showLabel={true}
            value={searchObject.description || ""}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ABSAdvSearchContainer;
