import { View, Text, Pressable, Image, StyleSheet, Dimensions } from "react-native";
import React from "react";
import SettingsContainer from "../../components/settings/SettingsContainer";
const { width, height } = Dimensions.get("window");
const Settings = () => {
  return (
    <View className="flex-1 bg-amber-50 ">
      <Image
        source={require("../../../assets/background.png")}
        style={[
          StyleSheet.absoluteFill,
          {
            width,
            height,
            opacity: 0.5,
          },
        ]}
      />
      <View className="flex-1 flex-col mt-2 ">
        <SettingsContainer />
      </View>
    </View>
  );
};

export default Settings;
