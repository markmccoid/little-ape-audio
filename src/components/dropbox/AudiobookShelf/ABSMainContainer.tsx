import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import React, { useState } from "react";
import { useGetAllABSBooks } from "@store/data/absHooks";
import ABSSearchInputText from "./search/ABSSearchInputText";
import { useABSStore } from "@store/store-abs";
import ABSBookResults from "./ABSBookResults";
import { colors } from "@constants/Colors";
import { Link, useRouter } from "expo-router";

const ABSMainContainer = () => {
  const { books, totalBookCount, selectedBookCount, isError, isLoading } = useGetAllABSBooks();
  const updateSearchObject = useABSStore((state) => state.actions.updateSearchObject);
  const router = useRouter();
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
      <View className="flex-col items-center">
        <Text className="text-lg font-semibold">Error Getting Books</Text>
        <Text className="text-lg text-center">
          Make sure you have setup AudiobookShelf Login Info.
        </Text>
        <View className="flex-row justify-center">
          <Pressable
            onPress={() => router.push("/settings/authroute")}
            className="p-2 bg-abs-700 rounded-lg border border-abs-500"
          >
            <Text className="text-lg font-semibold text-white">Update ABS Info</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-abs-100">
      <View className="bg-amber-200" style={{ backgroundColor: colors.absLightBg }}>
        <View className="m-1 flex-row justify-center ">
          {selectedBookCount === -1 ? (
            <Text className="text-base">Book Discovery</Text>
          ) : (
            <Text className="text-sm text-amber-800">
              Books Found - {selectedBookCount} of {totalBookCount}{" "}
            </Text>
          )}
        </View>
        <View className="flex-row justify-between mx-2 ">
          <View className="flex-1">
            <View className="flex-col ">
              <Text className="text-xs text-amber-700 pl-1">Title: </Text>
              <ABSSearchInputText updateSearch={handleUpdateSearch("title")} label="Title" />
            </View>
          </View>
          <View className="w-2" />
          <View className="flex-1">
            <View className="flex-col ">
              <Text className="text-xs text-amber-700 pl-1">Author: </Text>
              <ABSSearchInputText updateSearch={handleUpdateSearch("author")} label="Author" />
            </View>
          </View>
        </View>
        {/* <View className="flex-row justify-between mx-2">
          <ABSSearchInputText updateSearch={handleUpdateSearch("title")} label="Title" />

          <View className="w-2" />
          <ABSSearchInputText updateSearch={handleUpdateSearch("author")} label="Author" />
        </View> */}
        <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 10 }} />
      </View>

      <ABSBookResults books={books} />
    </View>
  );
};

export default ABSMainContainer;
