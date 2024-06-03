import { View, Text, ScrollView, Pressable, SafeAreaView } from "react-native";
import React, { useState } from "react";
import FilterCriteriaSearch from "./search/FilterCriteriaSearch";
import ABSSearchContainer from "./search/ABSSearchContainer";

const ABSFilterPageContainer = () => {
  const [page, setPage] = useState("genre");

  return (
    <View className="flex-1">
      <ABSSearchContainer />
      {/* <View className="flex-row m-2 space-x-2 ">
        <Pressable onPress={() => setPage("genre")} className="p-2 border bg-amber-200">
          <Text className="text-base font-semibold">Genre</Text>
        </Pressable>
        <Pressable onPress={() => setPage("search")} className="p-2 border bg-amber-200">
          <Text className="text-base font-semibold">Search</Text>
        </Pressable>
      </View> */}

      {/* {page === "genre" && <FilterCriteriaSearch />}
      {page === "search" && <ABSSearchContainer />} */}
    </View>
  );
};

export default ABSFilterPageContainer;
