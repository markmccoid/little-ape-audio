import { View, Text, Button, Pressable } from "react-native";
import React from "react";
import { Stack, useRouter } from "expo-router";
import { colors } from "../../../../constants/Colors";
import { ChevronBackIcon, FilterIcon, SearchIcon } from "@components/common/svg/Icons";
import { SortMenu } from "@components/dropbox/AudiobookShelf/SortMenu";

const ABSLayout = () => {
  const router = useRouter();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "AudiobookShelf",
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              className="flex-row items-center justify-start ml-[-10]"
            >
              <ChevronBackIcon size={30} color={colors.amber900} />
              <Text className="text-amber-900 text-lg font-semibold">Back</Text>
            </Pressable>
          ),
          presentation: "card",
          headerRight: () => (
            <View className="flex-row items-center p-1 mt-1">
              <Pressable className="mr-3">
                <SortMenu />
              </Pressable>
              <Pressable onPress={() => router.push("/audio/dropbox/audiobookshelf/advsearch")}>
                <SearchIcon color={colors.amber900} />
              </Pressable>
            </View>
          ),
          headerStyle: { backgroundColor: colors.amber200 },
          headerTintColor: colors.amber900,
        }}
      />

      <Stack.Screen
        name="[absitem]"
        options={{
          presentation: "card",
          // title: "overwrite",
          // headerBackTitleVisible: false,
          // headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="advsearch"
        options={{
          presentation: "modal",
          title: "Advanced Search",
          headerShown: false,
          // headerBackTitleVisible: false,
          // headerBackVisible: false,
          // headerStyle: { backgroundColor: colors.amber500 },
        }}
      />
    </Stack>
  );
};

export default ABSLayout;
