import { View, Text } from "react-native";
import React from "react";
import ABSFilterPageContainer from "@components/dropbox/AudiobookShelf/ABSFilterPageContainer";
import { useGetAllABSBooks } from "@store/data/absHooks";

const audiobookshelf = () => {
  return (
    <View>
      <ABSFilterPageContainer />
    </View>
  );
};

export default audiobookshelf;
