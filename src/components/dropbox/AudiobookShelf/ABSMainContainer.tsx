import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import React, { useState } from "react";
import { useGetAllABSBooks } from "@store/data/absHooks";
import ABSSearchInputText from "./search/ABSSearchInputText";
import { useABSStore } from "@store/store-abs";
import ABSBookResults from "./ABSBookResults";

const ABSMainContainer = () => {
  const { books, totalBookCount, selectedBookCount, isError, isLoading } = useGetAllABSBooks();
  const updateSearchObject = useABSStore((state) => state.actions.updateSearchObject);

  const handleUpdateSearch = (fieldName: string) => {
    return (fieldValue: string) => {
      updateSearchObject({ [fieldName]: fieldValue });
    };
  };
  if (isLoading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }
  if (isError) {
    return (
      <View>
        <Text>Error Getting Books</Text>
      </View>
    );
  }
  return (
    <View className="flex-1 bg-amber-50">
      <View className="bg-amber-200">
        <View className="m-1 flex-row justify-center ">
          {selectedBookCount === -1 ? (
            <Text className="text-base">Book Discovery</Text>
          ) : (
            <Text className="text-base">
              Books Found - {selectedBookCount} of {totalBookCount}{" "}
            </Text>
          )}
        </View>
        <View className="flex-row justify-between mx-2">
          <ABSSearchInputText updateSearch={handleUpdateSearch("title")} label="Title" />
          <View className="w-2" />
          <ABSSearchInputText updateSearch={handleUpdateSearch("author")} label="Author" />
        </View>
        <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 10 }} />
      </View>

      <ABSBookResults books={books} />
    </View>
  );
};

export default ABSMainContainer;
