import { View, Text, SafeAreaView, Dimensions, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import CustomHeader from "@components/dropbox/CustomHeader";
import { ABSGetLibraryItems, FilterType, absGetLibraryItems } from "@store/data/absAPI";
import ABSResultsContainer from "@components/dropbox/AudiobookShelf/ABSResultsContainer";
import { ChevronBackIcon } from "@components/common/svg/Icons";
import { colors } from "@constants/Colors";
import { SortMenu } from "@components/dropbox/AudiobookShelf/SortMenu";

export type ABSDirParams = {
  absdir: string;
  filterType: FilterType;
  filterValue: string;
  filterValueEncoded: string;
};
const ABSNewDir = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { absdir, filterType, filterValue, filterValueEncoded } =
    useLocalSearchParams<ABSDirParams>();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          // headerBackTitleVisible: false,
          headerBackVisible: true,
          headerTitle: `${filterValue}`,
          headerTintColor: colors.amber950,
          headerStyle: { backgroundColor: colors.amber400 },
          // header: () => (
          //   // <CustomHeader title={filterType || "/"} backText={`Back`} sessionAudioSource={"abs"} />
          //   <ABSHeader />
          // ),
          headerRight: () => (
            <View className="px-3 py-2 flex-row justify-end items-center h-full">
              <SortMenu />
            </View>
          ),
        }}
      />
      <ABSResultsContainer
        filterType={filterType}
        filterValueEncoded={filterValueEncoded}
        filterValue={filterValue}
        absdir={absdir}
      />
    </SafeAreaView>
  );
};

export default ABSNewDir;

function ABSHeader() {
  const router = useRouter();
  const { width, height } = Dimensions.get("window");

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.amber300,
      }}
      className="h-12 border-b border-b-black "
    >
      <TouchableOpacity onPress={router.back}>
        <View className="flex-row items-center flex-1 ">
          <ChevronBackIcon size={30} color={"black"} />
          <Text
            className={`text-lg ${"text-amber-950"}`}
            style={{ width: width / 1.25 }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {"Back"}
          </Text>
        </View>
      </TouchableOpacity>
      {/* <Text style={{ fontWeight: "bold", fontSize: 18 }}>{title}</Text> */}
    </View>
  );
}
