import { View, Text, Pressable } from "react-native";
import React from "react";
import { Link, Stack } from "expo-router";
import AddBook from "../../src/components/common/svg/AddBook";
import Monkey from "../../src/components/common/svg/Monkey";

const AudioLayout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Audio Books",
          headerRight: () => {
            return (
              <Link href="./audio/dropbox" asChild>
                <Pressable>
                  <AddBook size={25} />
                </Pressable>
                {/* <HeaderIconPressable>
            <AddBook size={25} />
          </HeaderIconPressable> */}
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
