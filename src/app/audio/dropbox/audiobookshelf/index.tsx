import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import ABSMainContainer from "@components/dropbox/AudiobookShelf/ABSMainContainer";

const audiobookshelf = () => {
  return (
    <SafeAreaView className="flex-1">
      <ABSMainContainer />
    </SafeAreaView>
  );
};

export default audiobookshelf;
