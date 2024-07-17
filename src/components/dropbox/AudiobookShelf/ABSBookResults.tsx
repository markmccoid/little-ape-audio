import { View, Text, FlatList, SafeAreaView } from "react-native";
import React, { Ref, useState } from "react";
import ABSResultsBookRow from "./ABSResultsBookRow";
import { properCase } from "@utils/otherUtils";
import { ABSGetLibraryItems } from "@store/data/absAPI";
import { SearchBarCommands } from "react-native-screens";
import { createFolderMetadataKey, useDropboxStore } from "@store/store-dropbox";
import { create } from "lodash";

type Props = {
  books: ABSGetLibraryItems;
};
const ABSBookResults = ({ books }: Props) => {
  const folderAttributes = useDropboxStore((state) => state.folderAttributes).map((el) => el.id);

  const renderItem = ({ item, index }) => (
    <ABSResultsBookRow
      book={item}
      index={index}
      key={item.id}
      isFavorite={folderAttributes.includes(createFolderMetadataKey(item.id))}
    />
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
