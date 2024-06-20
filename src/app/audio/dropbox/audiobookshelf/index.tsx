import { View, Text, SafeAreaView } from "react-native";
import React, { useEffect } from "react";
import ABSMainContainer from "@components/dropbox/AudiobookShelf/ABSMainContainer";
import { useABSStore } from "@store/store-abs";

const audiobookshelf = () => {
  const updateSearchObject = useABSStore((state) => state.actions.updateSearchObject);
  useEffect(() => {
    // clear searchObject in abs store upon closing
    return () => updateSearchObject(undefined);
  }, []);
  return (
    <SafeAreaView className="flex-1 bg-abs-100">
      <ABSMainContainer />
    </SafeAreaView>
  );
};

export default audiobookshelf;
