import { View, Text, FlatList, SafeAreaView } from "react-native";
import React, { Ref, useState } from "react";
import ABSResultsBookRow from "./ABSResultsBookRow";

import { ABSGetLibraryItems } from "./ABSAuthentication/absAPInew";

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
      windowSize={15}
      keyboardDismissMode="on-drag"
    />
  );
};

export default ABSBookResults;
