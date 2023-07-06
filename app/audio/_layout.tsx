import { View, Text, Pressable } from "react-native";
import React from "react";
import { Link, Stack } from "expo-router";
import AddBook from "../../src/components/common/svg/AddBook";
import Monkey from "../../src/components/common/svg/Monkey";
import { SettingsIcon } from "../../src/components/common/svg/Icons";
import { colors } from "../../src/constants/Colors";

const AudioLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Audio Books",
          headerStyle: { backgroundColor: colors.amber200 },
          headerTintColor: colors.amber900,
          headerRight: () => {
            return (
              <Link href="./audio/dropbox" asChild>
                <Pressable>
                  <AddBook size={25} />
                </Pressable>
              </Link>
            );
          },
          headerLeft: () => {
            return (
              <Link href="./settings" asChild replace>
                <Pressable>
                  <Monkey size={25} />
                </Pressable>
              </Link>
            );
          },
        }}
      />
      <Stack.Screen
        name="player"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.amber200 },
          headerTintColor: colors.amber900,
          headerRight: () => (
            <Link href="/audio/playersettings">
              <SettingsIcon size={25} />
            </Link>
          ),
        }}
      />
      <Stack.Screen
        name="playersettings"
        options={{
          presentation: "modal",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="dropbox"
        options={{
          title: "Dropbox",
          presentation: "modal",
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default AudioLayout;
