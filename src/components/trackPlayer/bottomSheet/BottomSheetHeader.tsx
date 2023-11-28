import { View, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { colors } from "@constants/Colors";
import {
  BookmarkIcon,
  BookmarkOutlineIcon,
  CloseIcon,
  ListIcon,
  SpeedIcon,
} from "@components/common/svg/Icons";
import PagerView from "react-native-pager-view";
import BottomSheet from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheet/BottomSheet";
import usePlaylistColors from "hooks/usePlaylistColors";

type Props = {
  pagerRef: PagerView;
  bottomSheetRef: BottomSheet;
  // Current index of pagerView component. i.e. what is showing chapters, speed, etc
  currPage: number;
};
const BottomSheetHeader = ({ pagerRef, bottomSheetRef, currPage }) => {
  const playlistColors = usePlaylistColors();
  return (
    <View
      className="flex-row justify-between px-4 py-2 rounded-t-xl"
      style={{
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: playlistColors.gradientTopText, //colors.amber950, // playlistColors.secondary.tintColor,
        // borderBottomWidth: StyleSheet.hairlineWidth,
        // borderBottomColor: playlistColors.secondary.tintColor,
        backgroundColor: playlistColors.gradientTop, //colors.amber50,
      }}
    >
      <TouchableOpacity onPress={() => pagerRef.current.setPage(0)}>
        <View
          className="p-1"
          style={{
            backgroundColor: currPage === 0 ? "white" : playlistColors.gradientTop,
            borderRadius: 5,
          }}
        >
          <ListIcon
            color={`${currPage === 0 ? colors.deleteRed : playlistColors.gradientTopText}`}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => pagerRef.current.setPage(1)}>
        <View
          className="p-1"
          style={{
            backgroundColor: currPage === 1 ? "white" : playlistColors.gradientTop,
            borderRadius: 5,
          }}
        >
          <SpeedIcon
            color={`${currPage === 1 ? colors.deleteRed : playlistColors.gradientTopText}`}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => pagerRef.current.setPage(2)}>
        <View
          className="p-1"
          style={{
            backgroundColor: currPage === 2 ? "white" : playlistColors.gradientTop,
            borderRadius: 5,
          }}
        >
          <BookmarkOutlineIcon
            color={`${currPage === 2 ? colors.deleteRed : playlistColors.gradientTopText}`}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => bottomSheetRef.current.close()}>
        <View
          className="p-1"
          style={{
            backgroundColor: colors.deleteRed, //playlistColors.gradientTop,

            borderRadius: 5,
          }}
        >
          <CloseIcon color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default BottomSheetHeader;
