import { View, Text } from "react-native";
import React from "react";

const ABSErrorView = ({ error }) => {
  return (
    <View className="flex flex-col bg-red-400 p-2 justify-center">
      <Text className="text-base text-center font-semibold">
        Cannot connect to AudiobookShelf Server
      </Text>
      <Text className="text-center">{error.message}</Text>
    </View>
  );
};

export default ABSErrorView;
