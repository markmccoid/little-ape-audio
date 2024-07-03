import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import React, { useState } from "react";
import { useGetFilterData } from "@store/data/absHooks";
import { useABSStore } from "@store/store-abs";
import { colors } from "@constants/Colors";

const ABSAdvSearchGenres = () => {
  const { filterData, isLoading, isError } = useGetFilterData();
  const { genres } = useABSStore((state) => state.searchObject);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const updateSearchObject = useABSStore((state) => state.actions.updateSearchObject);
  const [isInit, setIsInit] = useState(false);

  const addRemoveGenre = (genre) => {
    const isSelected = selectedGenres?.includes(genre);
    const updatedGenres =
      isSelected && selectedGenres.length > 0
        ? selectedGenres.filter((el) => el !== genre)
        : [...selectedGenres, genre];
    setSelectedGenres(updatedGenres);
  };
  const clearGenres = () => {
    setSelectedGenres([]);
  };

  // Update the zustand search object for genres
  React.useEffect(() => {
    if (isInit) {
      updateSearchObject({ genres: selectedGenres });
    }
  }, [selectedGenres, isInit]);

  // Clear the genres when we see an empty genre list from Search Object
  React.useEffect(() => {
    if (!isInit) {
      setSelectedGenres(genres || []);
      setIsInit(true);
    }
    if (!genres) clearGenres();
  }, [genres, isInit]);

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
