import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { useReducer, useState } from "react";
import {
  BookmarkIcon,
  BookmarkOutlineIcon,
  BookmarkPlusIcon,
  ListIcon,
  SpeedIcon,
} from "@components/common/svg/Icons";
import { useBottomSheet } from "@gorhom/bottom-sheet";
import { formatSeconds } from "@utils/formatUtils";
import { useCurrentPlaylist, usePlaybackStore } from "@store/store";

type Props = {
  isExpanded: boolean;
  setPage: (index: number) => void;
  snapToIndex: (index: number) => void;
  expand: () => void;
};
const BottomSheetMenu = ({ isExpanded, setPage, expand, snapToIndex }: Props) => {
  const playbackActions = usePlaybackStore((state) => state.actions);
  const currRate = usePlaybackStore((state) => state.currentRate);
  const didUpdate = usePlaybackStore((state) => state.didUpdate);
  const bookmarkLength = playbackActions.getBookmarks()?.length;

  const handleAddBookmark = () => {
    const currTrackPos = playbackActions.getCurrentTrackPosition();
    Alert.prompt(
      "Enter Bookmark Name",
      "Enter a name for the bookmark at " + formatSeconds(currTrackPos),
      [
        {
          text: "OK",
          onPress: (bookmarkName) => {
            playbackActions.addBookmark(bookmarkName, currTrackPos);
          },
        },
        { text: "Cancel", onPress: () => {} },
      ]
    );
  };

  return (
    <View className="flex-row justify-between px-5">
      <TouchableOpacity
        onPress={() => {
          setPage(0);
          if (!isExpanded) snapToIndex(0);
        }}
      >
        <ListIcon />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setPage(1);
          if (!isExpanded) snapToIndex(0);
        }}
      >
        <View className="flex-col items-center justify-center">
          <SpeedIcon />
          <View className="flex-row items-center">
            <Text allowFontScaling={false} className="text-sm">
              {currRate}
            </Text>
            <Text allowFontScaling={false} className="text-xs">
              x
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      {/* VIEW BOOKMARK */}
      <TouchableOpacity
        onPress={() => {
          setPage(2);
          if (!isExpanded) snapToIndex(0);
        }}
        className={`flex-col items-center ${bookmarkLength ? "justify-center" : "justify-start"}`}
      >
        <BookmarkOutlineIcon />
        {bookmarkLength && (
          <View
            className="z-30 flex-row justify-center items-center
          w-[18] h-[18] rounded-lg bg-green-600 border-green-800 border "
          >
            <Text className="text-xs text-amber-50">{bookmarkLength}</Text>
          </View>
        )}
      </TouchableOpacity>
      {/* ADD BOOKMARK */}
      <TouchableOpacity onPress={handleAddBookmark} className="">
        {/* <View
          className="z-30 flex-row justify-center items-center absolute 
          w-[18] h-[18] rounded-lg bg-green-600 border-green-800 border top-[-5] right-[-6]"
        >
          <Text className="z-20 text-white text-xs ">+</Text>
        </View> */}

        <BookmarkPlusIcon />
      </TouchableOpacity>
      {/* <Text>BottomSheetMenu</Text> */}
    </View>
  );
};

export default BottomSheetMenu;
