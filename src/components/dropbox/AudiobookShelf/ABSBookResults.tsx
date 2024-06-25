import { View, Text, FlatList, SafeAreaView } from "react-native";
import React, { Ref, useState } from "react";
import ABSResultsBookRow from "./ABSResultsBookRow";
import { properCase } from "@utils/otherUtils";
import { ABSGetLibraryItems } from "@store/data/absAPI";
import { SearchBarCommands } from "react-native-screens";

type Props = {
  books: ABSGetLibraryItems;
};
const ABSBookResults = ({ books }: Props) => {
  const [scrollY, setScrollY] = useState(0);
  const renderItem = ({ item, index }) => (
    <ABSResultsBookRow book={item} index={index} key={item.id} />
  );

  return (
    <FlatList
      contentContainerStyle={{ flexDirection: "column" }}
      data={books}
      renderItem={renderItem}
      keyExtractor={(item) => item?.id}
      keyboardDismissMode="on-drag"
    />
  );
};

export default ABSBookResults;
