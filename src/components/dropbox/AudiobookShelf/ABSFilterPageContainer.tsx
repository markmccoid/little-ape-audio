import { View, Text, ScrollView, Pressable } from "react-native";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { absGetLibraryFilterData } from "@store/data/absAPI";
import { Link } from "expo-router";
import ABSErrorView from "./ABSErrorView";

const ABSFilterPageContainer = () => {
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
    <>
      {!isLoading && (
        <View>
          <Text className="mt-2 mx-2 text-base font-semibold">Select a Genre</Text>
          <ScrollView>
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
                <Pressable
                  className={`py-1 px-2 ${index === 0 && "border-t"} border-b border-amber-800`}
                >
                  <Text>{genre.name}</Text>
                </Pressable>
              </Link>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );
};

export default ABSFilterPageContainer;
