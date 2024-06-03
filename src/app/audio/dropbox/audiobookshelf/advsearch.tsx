import { View, Text } from "react-native";
import React from "react";
import { useFocusEffect } from "expo-router";
import ABSAdvSearchContainer from "@components/dropbox/AudiobookShelf/search/ABSAdvSearchContainer";

const AdvancedSearch = () => {
  useFocusEffect(() => {
    console.log("Focuse Effect - advsearch.tsx");
    return () => console.log("UNMOUNT focus effect-advsearch.tsx");
  });
  return (
    <View className="flex-1">
      <ABSAdvSearchContainer />
    </View>
  );
};

export default AdvancedSearch;
