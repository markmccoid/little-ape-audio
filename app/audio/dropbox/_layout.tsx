import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const DropboxLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Audio Sources",
          presentation: "modal",
          headerBackTitleVisible: false,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="[newdir]"
        options={{
          title: "overwrite",
          presentation: "card",
          headerBackTitleVisible: false,
          headerBackVisible: false,
        }}
      />
    </Stack>
  );
};

export default DropboxLayout;
