import { View, Text, SafeAreaView, ScrollView, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import CustomHeader from "@components/dropbox/CustomHeader";
import {
  ABSGetLibraryItems,
  FilterType,
  absGetItemDetails,
  absGetLibraryItems,
} from "@store/data/absAPI";
import ABSResultsContainer from "@components/dropbox/AudiobookShelf/ABSResultsContainer";
import { useQuery } from "@tanstack/react-query";
import ABSBookContainer from "@components/dropbox/AudiobookShelf/book/ABSBookContainer";

export type ABSDirParams = {
  absitem: string;
  title: string;
};
const ABSItem = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { absitem, title } = useLocalSearchParams<ABSDirParams>();

  const { data, error, isLoading } = useQuery({
    queryKey: [absitem],
    queryFn: async () => await absGetItemDetails(absitem),
  });

  let backTitle = title || "Back";
  if (!isLoading) {
    backTitle = data?.media?.metadata?.title || backTitle;
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerBackTitleVisible: false,
          headerBackVisible: false,
          header: () => (
            <CustomHeader title={"BOOK"} backText={backTitle} sessionAudioSource={"abs"} />
          ),
        }}
      />
      {isLoading ? (
        <View>
          <Text>isLoading</Text>
        </View>
      ) : (
        <ABSBookContainer
          audioFiles={data.audioFiles}
          media={data.media}
          coverURI={data.coverURI}
          key={data.id}
        />
      )}
    </SafeAreaView>
  );
};

export default ABSItem;
