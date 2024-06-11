import { View, Text, Button, Pressable } from "react-native";
import React from "react";
import { Stack, useRouter } from "expo-router";
import { colors } from "../../../../constants/Colors";
import { ChevronBackIcon, FilterIcon, SearchIcon } from "@components/common/svg/Icons";
import { SortMenu } from "@components/dropbox/AudiobookShelf/SortMenu";
import { useABSStore } from "@store/store-abs";

const ABSLayout = () => {
  const router = useRouter();
  const searchObject = useABSStore((state) => state.searchObject);
  let searchActive = false;
  if (searchObject.description || searchObject.genres || searchObject.tags) {
    searchActive = true;
  }
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
          headerRight: () => (
            <View className="flex-row items-center">
              <Pressable className="p-3">
                <SortMenu />
              </Pressable>
              <Pressable
                onPress={() => router.push("/audio/dropbox/audiobookshelf/advsearch")}
                className="p-3 items-center justify-center"
              >
                <SearchIcon color={searchActive ? "green" : colors.amber900} />
                {/* <View className="bg-green-600 w-[9] h-[9] rounded-md absolute top-[17] right-[22]" /> */}
              </Pressable>
            </View>
          ),
          presentation: "card",
          headerStyle: { backgroundColor: colors.absHeaderBg },
          headerTintColor: colors.amber950,
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
