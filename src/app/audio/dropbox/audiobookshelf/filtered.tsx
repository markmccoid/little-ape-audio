import { View, Text, SafeAreaView, ScrollView, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import CustomHeader from "@components/dropbox/CustomHeader";
import { ABSGetLibraryItems, FilterType, absGetLibraryItems } from "@store/data/absAPI";
import ABSResultsContainer from "@components/dropbox/AudiobookShelf/ABSResultsContainer";

export type ABSDirParams = {
  absdir: string;
  filterType: FilterType;
  filterValue: string;
  filterValueEncoded: string;
};
const ABSNewDir = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { absdir, filterType, filterValue, filterValueEncoded } =
    useLocalSearchParams<ABSDirParams>();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerBackTitleVisible: false,
          headerBackVisible: false,
          header: () => (
            <CustomHeader title={filterType || "/"} backText={`Back`} sessionAudioSource={"abs"} />
          ),
        }}
      />
      <ABSResultsContainer
        filterType={filterType}
        filterValueEncoded={filterValueEncoded}
        filterValue={filterValue}
        absdir={absdir}
      />
    </SafeAreaView>
  );
};

export default ABSNewDir;
