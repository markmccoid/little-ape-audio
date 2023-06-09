import { View, Text, Pressable } from "react-native";
import React from "react";
import { Link } from "expo-router";
import SettingsContainer from "../../src/settings/SettingsContainer";

const Settings = () => {
  return (
    <View className="flex-1 flex-col bg-amber-50 mt-2">
      {/* <View className="flex-row justify-around mt-3">
        <Link href="./settings/dropboxauth" asChild>
          <Pressable className="rounded-md p-2 border border-black bg-amber-300">
            <Text>Dropbox</Text>
          </Pressable>
        </Link>
        <Link href="../audio" replace asChild>
          <Pressable className="rounded-md p-2 border border-black bg-amber-300">
            <Text>Home</Text>
          </Pressable>
        </Link>
      </View> */}
      <SettingsContainer />
    </View>
  );
};

export default Settings;
