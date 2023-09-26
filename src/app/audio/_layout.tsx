import { View, Text, Pressable } from "react-native";
import React from "react";
import { Link, Stack } from "expo-router";
import AddBook from "../../components/common/svg/AddBook";
import Monkey from "../../components/common/svg/Monkey";
import { SettingsIcon } from "../../components/common/svg/Icons";
import { colors } from "../../constants/Colors";
import useSleepTimer from "@components/common/sleepTimer/useSleepTimer";
import { useSettingStore } from "@store/store-settings";

const AudioLayout = () => {
  const countdownActive = useSettingStore((state) => state.countdownActive);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: countdownActive ? "#feb9b9" : colors.amber200,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Audio Books",
          // headerStyle: { backgroundColor: colors.amber200 },
          headerTintColor: colors.amber900,
          headerRight: () => {
            return (
              <Link href="/audio/dropbox" asChild>
                <Pressable className="p-[10] mr-[-10]">
                  <AddBook size={25} />
                </Pressable>
              </Link>
            );
          },
          headerLeft: () => {
            return (
              <Link href="/settings" asChild replace>
                <Pressable className="p-[10] ml-[-10]">
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
          // headerStyle: { backgroundColor: colors.amber200 },
          headerTintColor: colors.amber900,
          headerRight: () => (
            <Link href="/audio/playersettings" asChild>
              <Pressable className="p-[10] mr-[-10]">
                <SettingsIcon size={25} />
              </Pressable>
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
      <Stack.Screen
        name="playlistedit"
        options={{
          title: "Edit Playlist",
          presentation: "modal",
          headerShown: true,
        }}
      />
    </Stack>
  );
};

export default AudioLayout;
