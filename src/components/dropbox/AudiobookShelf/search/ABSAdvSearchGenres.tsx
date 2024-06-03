import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import React from "react";
import { useGetFilterData } from "@store/data/absHooks";
import { useABSStore } from "@store/store-abs";
import { colors } from "@constants/Colors";

const ABSAdvSearchGenres = () => {
  const { filterData, isLoading, isError } = useGetFilterData();
  const { genres: selectedGenres } = useABSStore((state) => state.searchObject);
  const updateSearchObject = useABSStore((state) => state.actions.updateSearchObject);
  if (isLoading) return null;
  if (isError)
    return (
      <View>
        <Text>Error Reading Filter Data</Text>
      </View>
    );
  const addRemoveGenre = (genre: string) => {
    const selected = selectedGenres?.includes(genre);
    // If already selected, remove from list
    if (selected) {
      updateSearchObject({ genres: selectedGenres.filter((el) => el !== genre) });
    } else {
      updateSearchObject({ genres: [...(selectedGenres || []), genre] });
    }
  };
  const clearGenres = () => {
    updateSearchObject({ genres: undefined });
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
      {filterData.genres.map((genre, index) => {
        const selected = selectedGenres?.includes(genre.name);
        return (
          <Pressable
            onPress={() => addRemoveGenre(genre.name)}
            key={genre.b64Encoded}
            className={`py-1 px-2 w-[50%] border-b border-r border-amber-800 ${
              selected && "bg-green-300"
            } `}
          >
            <Text className="text-xs">{genre.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

export default ABSAdvSearchGenres;
