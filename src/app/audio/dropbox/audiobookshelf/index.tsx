import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import ABSFilterPageContainer from "@components/dropbox/AudiobookShelf/ABSFilterPageContainer";
import { useGetAllABSBooks } from "@store/data/absHooks";

const audiobookshelf = () => {
  return (
    <SafeAreaView className="flex-1">
      <ABSFilterPageContainer />
    </SafeAreaView>
  );
};

export default audiobookshelf;
