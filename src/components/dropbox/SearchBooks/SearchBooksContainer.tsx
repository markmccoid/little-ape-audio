import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { FolderMetadata, useDropboxStore } from "@store/store-dropbox";
import { flatMap } from "lodash";
import SearchBookResults from "./SearchBookResults";
import SearchBooksSearch from "./SearchBooksSearch";
import { FlatFolderMetadata } from "./SearchBooksSearch";

const SearchBooksContainer = () => {
  const route = useRouter();
  const [resultData, setResultData] = useState<FlatFolderMetadata>();

  return (
    <View className="m-2">
      <SearchBooksSearch setResultData={setResultData} />
      <SearchBookResults resultData={resultData} />
    </View>
  );
};

export default SearchBooksContainer;
