import { View, Text } from "react-native";
import React from "react";
import DropboxAuth from "../../src/components/dropbox/DropboxAuth";

const DropboxAuthScreen = () => {
  return (
    <View className="flex-1 bg-amber-50">
      <DropboxAuth />
    </View>
  );
};

export default DropboxAuthScreen;
