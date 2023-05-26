import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const SettingsLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen name="dropboxauth" options={{ title: "Dropbox Auth" }} />
    </Stack>
  );
};

export default SettingsLayout;
