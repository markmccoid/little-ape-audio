import { View, Text } from "react-native";
import React from "react";
import DropboxAuth from "../../src/components/dropbox/DropboxAuth";

const DropboxAuthScreen = () => {
  return (
    <View>
      <Text>DropboxAuthScreen</Text>
      <DropboxAuth />
    </View>
  );
};

export default DropboxAuthScreen;
