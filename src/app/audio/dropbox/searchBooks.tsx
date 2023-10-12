import { View, Text } from "react-native";
import React from "react";
import SearchBooksContainer from "@components/dropbox/SearchBooks/SearchBooksContainer";

const searchBooks = () => {
  return (
    <View className="flex-1">
      <SearchBooksContainer />
    </View>
  );
};

export default searchBooks;
