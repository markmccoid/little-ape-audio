import { View, Text, Pressable } from "react-native";
import React from "react";
import SettingsContainer from "../../src/settings/SettingsContainer";

const Settings = () => {
  return (
    <View className="flex-1 flex-col bg-amber-50 mt-2">
      <SettingsContainer />
    </View>
  );
};

export default Settings;
