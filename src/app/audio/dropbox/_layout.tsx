import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { colors } from "../../../constants/Colors";

const DropboxLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Add Audio",
          presentation: "modal",
          headerBackTitleVisible: false,
          headerBackVisible: false,
          headerStyle: { backgroundColor: colors.amber200 },
          headerTintColor: colors.amber900,
        }}
      />
      <Stack.Screen
        name="searchBooks"
        options={{
          title: "Search Books",
          presentation: "card",
          headerStyle: { backgroundColor: colors.amber200 },
          headerTintColor: colors.amber900,
        }}
      />
      <Stack.Screen
        name="audiobookshelf"
        options={{
          headerShown: false,
          title: "AudiobookShelf",
          presentation: "card",
          headerStyle: { backgroundColor: colors.amber200 },
          headerTintColor: colors.amber900,
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
