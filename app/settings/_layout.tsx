import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Link, Stack } from "expo-router";
import { colors } from "../../src/constants/Colors";
import { BackIcon, HomeIcon } from "../../src/components/common/svg/Icons";

const SettingsLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Settings",
          headerStyle: { backgroundColor: colors.amber200 },
          headerTintColor: colors.amber900,
          headerLeft: () => (
            <Link href="./audio">
              <HomeIcon />
            </Link>
          ),
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
      <Stack.Screen
        name="managetracksroute"
        options={{
          title: "Manage Tracks",
          headerStyle: { backgroundColor: colors.amber200 },
          headerTintColor: colors.amber900,
        }}
      />
      <Stack.Screen
        name="foldermetadataroute"
        options={{
          title: "Folder Metadata Storage",
          headerStyle: { backgroundColor: colors.amber200 },
          headerTintColor: colors.amber900,
        }}
      />
    </Stack>
  );
};

export default SettingsLayout;
