import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { defaultImages, getRandomNumber } from "@store/storeUtils";
import { ABSGetLibraryItems, absGetLibraryItems } from "@store/data/absAPI";
import { getImageSize, properCase } from "@utils/otherUtils";
import { mapKeys } from "lodash";
import { useQuery } from "@tanstack/react-query";
import ABSErrorView from "./ABSErrorView";
import ABSResultsBookRow from "./ABSResultsBookRow";
import { ABSDirParams } from "@app/audio/dropbox/audiobookshelf/filtered";
import { useABSStore } from "@store/store-abs";
import { useGetABSBooks } from "@store/data/absHooks";
import ABSResultSearchInput from "./ABSResultSearchInput";

const ABSResultsContainer = ({
  absdir,
  filterType,
  filterValue,
  filterValueEncoded,
}: ABSDirParams) => {
  // const { field: sortField, direction: sortDirection } = useABSStore((state) => state.resultSort);
  const { books, isLoading, error } = useGetABSBooks({ filterType, filterValueEncoded });

  //! Error view - most likely "server not available"
  if (error) {
    return <ABSErrorView error={error} />;
  }

  const renderItem = ({ item, index }) => (
    <ABSResultsBookRow book={item} index={index} key={item.id} />
  );

  return (
    <View className="flex-1 flex-col">
      <View className="flex-row m-1">
        <Text>Filter Type: </Text>
        <Text className="font-semibold">{properCase(filterType)} </Text>
        <Text>Filter Value: </Text>
        <Text className="flex-1 font-semibold">{filterValue}</Text>
      </View>
      {/* <ABSResultSearchInput updateSearch={handleUpdateSearch} /> */}
      <FlatList data={books} renderItem={renderItem} keyExtractor={(item) => item.id} />
    </View>
  );
};

export default ABSResultsContainer;
