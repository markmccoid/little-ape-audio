import { View, Text, SafeAreaView, Pressable, ScrollView } from "react-native";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { absGetLibraryFilterData } from "@store/data/absAPI";
import { Link } from "expo-router";
import ABSErrorView from "../ABSErrorView";

const FilterCriteriaSearch = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["absfilterdata"],
    queryFn: async () => await absGetLibraryFilterData(),
  });

  if (isLoading) {
    return (
      <View className="flex flex-col bg-gray-200 p-4 justify-center items-center">
        <Text className="text-base font-semibold">Loading...</Text>
      </View>
    );
  }

  if (error) {
    return <ABSErrorView error={error} />;
  }

  return (
    <ScrollView className="mb-10" contentContainerStyle={{ paddingBottom: 50 }}>
      {data.genres.map((genre, index) => (
        <Link
          href={{
            pathname: "audio/dropbox/audiobookshelf/filtered",
            params: {
              filterType: "genres",
              filterValue: genre.name,
              filterValueEncoded: genre.b64Encoded,
            },
          }}
          key={genre.b64Encoded}
          asChild
          className={`${index % 2 === 0 ? "bg-amber-100" : "bg-amber-50"}`}
        >
          <Pressable className={`py-1 px-2 ${index === 0 && "border-t"} border-b border-amber-800`}>
            <Text>{genre.name}</Text>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
};

export default FilterCriteriaSearch;
