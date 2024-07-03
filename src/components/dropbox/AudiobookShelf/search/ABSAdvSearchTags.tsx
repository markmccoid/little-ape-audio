import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { useGetFilterData } from "@store/data/absHooks";
import { useABSStore } from "@store/store-abs";
import { colors } from "@constants/Colors";

const ABSAdvSearchGenres = () => {
  const { filterData, isLoading, isError } = useGetFilterData();
  const { tags } = useABSStore((state) => state.searchObject);
  const [selectedTags, setSelectedTags] = useState([]);
  const updateSearchObject = useABSStore((state) => state.actions.updateSearchObject);
  const [isInit, setIsInit] = useState(false);

  const addRemoveTag = (tag: string) => {
    const isSelected = selectedTags?.includes(tag);
    // If already selected, remove from list
    const updatedTags =
      isSelected && selectedTags.length > 0
        ? selectedTags.filter((el) => el !== tag)
        : [...selectedTags, tag];
    setSelectedTags(updatedTags);
  };

  // When a change is made to the tag selection, update the zustand search object
  useEffect(() => {
    if (isInit) {
      updateSearchObject({ tags: selectedTags });
    }
  }, [selectedTags, isInit]);

  // When the zustand tag object is empty, make sure to clear the local tags
  useEffect(() => {
    if (!isInit) {
      setSelectedTags(tags || []);
      setIsInit(true);
    }
    if (!tags) setSelectedTags([]);
    // setSelectedTags(tags);
  }, [tags]);

  if (isLoading) return null;
  if (isError)
    return (
      <View>
        <Text>Error Reading Filter Data</Text>
      </View>
    );

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
            onPress={() => addRemoveTag(tag.name)}
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
