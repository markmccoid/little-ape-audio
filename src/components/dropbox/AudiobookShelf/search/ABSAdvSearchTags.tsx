import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import React from "react";
import { useGetFilterData } from "@store/data/absHooks";
import { useABSStore } from "@store/store-abs";
import { colors } from "@constants/Colors";

const ABSAdvSearchGenres = () => {
  const { filterData, isLoading, isError } = useGetFilterData();
  const { tags: selectedTags } = useABSStore((state) => state.searchObject);
  const updateSearchObject = useABSStore((state) => state.actions.updateSearchObject);
  if (isLoading) return null;
  if (isError)
    return (
      <View>
        <Text>Error Reading Filter Data</Text>
      </View>
    );
  const addRemoveGenre = (tag: string) => {
    const selected = selectedTags?.includes(tag);
    // If already selected, remove from list
    if (selected) {
      updateSearchObject({ tags: selectedTags.filter((el) => el !== tag) });
    } else {
      updateSearchObject({ tags: [...(selectedTags || []), tag] });
    }
  };
  const clearTags = () => {
    updateSearchObject({ tags: undefined });
  };
  return (
    <ScrollView
      contentContainerStyle={{
        flexDirection: "row",
        flexWrap: "wrap",
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.amber800,
      }}
    >
      {filterData.tags.map((tag, index) => {
        const selected = selectedTags?.includes(tag.name);
        return (
          <Pressable
            onPress={() => addRemoveGenre(tag.name)}
            key={tag.b64Encoded}
            className={`py-1 px-2 w-[50%] border-b border-r border-amber-800 ${
              selected && "bg-green-300"
            } `}
          >
            <Text className="text-xs">{tag.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

export default ABSAdvSearchGenres;
