import { View, Text, Button, Pressable } from "react-native";
import React from "react";
import { Stack, useRouter } from "expo-router";
import { colors } from "../../../../constants/Colors";
import { ChevronBackIcon } from "@components/common/svg/Icons";

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
          headerStyle: { backgroundColor: colors.amber200 },
          headerTintColor: colors.amber900,
        }}
      />

      <Stack.Screen
        name="filtered"
        options={{
          title: "overwrite",
          presentation: "card",
          headerBackTitleVisible: false,
          headerBackVisible: false,
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
    </Stack>
  );
};

export default ABSLayout;
