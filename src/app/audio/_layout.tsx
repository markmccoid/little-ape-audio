import { View, Text, Pressable, Appearance } from "react-native";
import React, { useEffect, useState } from "react";
import { Link, Stack } from "expo-router";
import AddBook from "../../components/common/svg/AddBook";
import Monkey from "../../components/common/svg/Monkey";
import { colors } from "../../constants/Colors";
import { useSettingStore } from "@store/store-settings";

const AudioLayout = () => {
  const countdownActive = useSettingStore((state) => state.countdownActive);
  const colorScheme = Appearance.getColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: countdownActive ? "#feb9b9" : isDark ? colors.amber500 : colors.amber200,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Audio Books",
          // headerStyle: { backgroundColor: colors.amber200 },
          headerTintColor: colors.amber950,
          headerRight: () => {
            return (
              <Link href="/audio/dropbox/" asChild>
                <Pressable className="p-[10] mr-[-10]">
                  <AddBook
                    size={25}
                    headphoneColor={isDark ? "black" : colors.amber900}
                    plusBGColor={isDark ? colors.amber900 : colors.amber700}
                  />
                </Pressable>
              </Link>
            );
          },
          headerLeft: () => {
            return (
              <Link href="/settings/" asChild replace>
                <Pressable className="p-[10] ml-[-10]">
                  <Monkey size={25} color={isDark ? "black" : colors.amber900} />
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
          // headerStyle: {
          //   backgroundColor: countdownActive ? "#feb9b9" : bgColors.bg,
          // },
          // headerTintColor: bgColors.tint,
          // headerRight: () => (
          //   <Link href="/audio/playersettings" asChild>
          //     <Pressable className="p-[10] mr-[-10]">
          //       <SettingsIcon size={25} />
          //     </Pressable>
          //   </Link>
          // ),
        }}
      />
      <Stack.Screen
        name="playersettings"
        options={{
          presentation: "modal",
          headerShown: false,
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
      <Stack.Screen
        name="trackmove"
        options={{
          title: "Move Track",
          presentation: "modal",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="externalLink"
        options={{
          title: "overwrite",
          presentation: "card",
        }}
      />
    </Stack>
  );
};

export default AudioLayout;
