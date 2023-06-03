import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { colors } from "../../src/constants/Colors";

const SettingsLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Settings",
          headerStyle: { backgroundColor: colors.amber200 },
          headerTintColor: colors.amber900,
        }}
      />
      <Stack.Screen
        name="dropboxauth"
        options={{
          title: "Dropbox Auth",
          headerStyle: { backgroundColor: colors.amber200 },
          headerTintColor: colors.amber900,
        }}
      />
    </Stack>
  );
};

export default SettingsLayout;
