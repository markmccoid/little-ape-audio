import { View, Text, FlatList, SafeAreaView } from "react-native";
import React from "react";
import ABSResultsBookRow from "./ABSResultsBookRow";
import { properCase } from "@utils/otherUtils";
import { ABSGetLibraryItems } from "@store/data/absAPI";

type Props = {
  books: ABSGetLibraryItems;
};
const ABSBookResults = ({ books }: Props) => {
  const renderItem = ({ item, index }) => (
    <ABSResultsBookRow book={item} index={index} key={item.id} />
  );

  return (
    <FlatList
      contentContainerStyle={{ flexDirection: "column" }}
      data={books}
      renderItem={renderItem}
      keyExtractor={(item) => item?.id}
    />
  );
};

export default ABSBookResults;
