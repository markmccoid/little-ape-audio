import { View, Text, Pressable, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { useFocusEffect } from "expo-router";
import ABSAdvSearchGenres from "./ABSAdvSearchGenres";
import ABSAdvSearchTags from "./ABSAdvSearchTags";
import HiddenContainer from "@components/common/hiddenContainer/HiddenContainer";
import { useABSStore } from "@store/store-abs";
import ABSResultSearchInputText from "./ABSSearchInputText";
import { useGetAllABSBooks } from "@store/data/absHooks";
import { CheckCircleIcon, EmptyCircleIcon } from "@components/common/svg/Icons";
import { colors } from "@constants/Colors";
import SegmentedControl from "@react-native-segmented-control/segmented-control";

const buildExtraInfo = (selectedItems: string[]) => {
  if (!selectedItems || selectedItems?.length === 0) return "";

  return `${selectedItems[0]} ${
    selectedItems?.length > 1 ? `+ ${selectedItems.length - 1} more` : ""
  } `;
};
const ABSAdvSearchContainer = () => {
  useFocusEffect(() => {
    // console.log("Focuse Effect - ABSAdvSearchContianer.tsx");
    // return () => console.log("UNMOUNT focus effect-ABSAdvSearchContianer");
  });
  const searchObject = useABSStore((state) => state.searchObject);
  const { selectedBookCount } = useGetAllABSBooks();
  const updateSearchObject = useABSStore((state) => state.actions.updateSearchObject);
  const updateDescription = (description: string) => {
    updateSearchObject({ description });
  };

  const favIndex =
    searchObject.favorites === "exclude" ? 1 : searchObject.favorites === "only" ? 2 : 0;
  const isReadIndex =
    searchObject.isRead === "exclude" ? 1 : searchObject.isRead === "only" ? 2 : 0;
  return (
    <View className="bg-abs-50 h-full">
      <View className="p-1 border-b border-abs-800 mb-2 flex-row justify-center bg-abs-400">
        <Text className="text-lg font-semibold text-abs-950">Advanced Search</Text>
      </View>
      <View className="flex-row justify-center">
        <Text className="text-base font-semibold">
          Matched {selectedBookCount === -1 ? 0 : selectedBookCount} Books
        </Text>
      </View>
      <ScrollView className="flex-col bg-abs-50" contentContainerStyle={{}}>
        <View className="flex-row justify-between mx-1 mt-1 mb-2 items-center">
          <View className="flex-col items-center">
            <Text className="text-abs-950 text-xs">Books Marked as Favorite</Text>
            <SegmentedControl
              values={["Include", "Exclude", "Only"]}
              style={{
                height: 25,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.abs950,
                width: 185,
              }}
              activeFontStyle={{ color: colors.abs100, fontSize: 13 }}
              tintColor={colors.abs600}
              backgroundColor={colors.abs100}
              selectedIndex={favIndex}
              onChange={(event) => {
                switch (event.nativeEvent.selectedSegmentIndex) {
                  case 0:
                    updateSearchObject({
                      favorites: undefined,
                    });
                    break;
                  case 1:
                    updateSearchObject({
                      favorites: "exclude",
                    });
                    break;
                  case 2:
                    updateSearchObject({
                      favorites: "only",
                    });
                    break;
                  default:
                    break;
                }
              }}
            />
          </View>
          {/* isRead Exclude */}
          <View className="flex-col items-center">
            <Text className="text-abs-950 text-xs">Books Marked as Read</Text>
            <SegmentedControl
              values={["Include", "Exclude", "Only"]}
              style={{
                height: 25,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.abs950,
                width: 185,
              }}
              activeFontStyle={{ color: colors.abs100, fontSize: 13 }}
              tintColor={colors.abs600}
              backgroundColor={colors.abs100}
              selectedIndex={isReadIndex}
              onChange={(event) => {
                switch (event.nativeEvent.selectedSegmentIndex) {
                  case 0:
                    updateSearchObject({
                      isRead: undefined,
                    });
                    break;
                  case 1:
                    updateSearchObject({
                      isRead: "exclude",
                    });
                    break;
                  case 2:
                    updateSearchObject({
                      isRead: "only",
                    });
                    break;
                  default:
                    break;
                }
              }}
            />
          </View>
        </View>
        <HiddenContainer
          title="Genres"
          style={{ height: 200 }}
          titleInfo={buildExtraInfo(searchObject?.genres)}
          leftIconFunction={() => updateSearchObject({ genres: undefined })}
        >
          <ABSAdvSearchGenres />
        </HiddenContainer>
        <HiddenContainer
          title="Tags"
          style={{ height: 200 }}
          titleInfo={buildExtraInfo(searchObject?.tags)}
          leftIconFunction={() => updateSearchObject({ tags: undefined })}
        >
          <ABSAdvSearchTags />
        </HiddenContainer>
        {/* <View className="flex-col mx-2 mt-2 flex-1">
          <Text className="text-base font-semibold">Description</Text>
        </View> */}
        <View className="flex-row p-2">
          <ABSResultSearchInputText
            updateSearch={updateDescription}
            label="Description"
            showLabel={true}
            value={searchObject.description || ""}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ABSAdvSearchContainer;
