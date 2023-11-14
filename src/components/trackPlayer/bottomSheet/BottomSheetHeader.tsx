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

type Props = {
  pagerRef: PagerView;
  bottomSheetRef: BottomSheet;
  // Current index of pagerView component. i.e. what is showing chapters, speed, etc
  currPage: number;
};
const BottomSheetHeader = ({ pagerRef, bottomSheetRef, currPage }) => {
  return (
    <View
      className="flex-row justify-between px-4 py-2 rounded-t-xl"
      style={{
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.amber950, // playlistColors.secondary.tintColor,
        // borderBottomWidth: StyleSheet.hairlineWidth,
        // borderBottomColor: playlistColors.secondary.tintColor,
        backgroundColor: colors.amber50, //playlistColors.secondary.color,
      }}
    >
      <TouchableOpacity onPress={() => pagerRef.current.setPage(0)}>
        <ListIcon color={`${currPage === 0 ? colors.deleteRed : colors.amber950}`} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => pagerRef.current.setPage(1)}>
        <SpeedIcon color={`${currPage === 1 ? colors.deleteRed : colors.amber950}`} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => pagerRef.current.setPage(2)}>
        <BookmarkOutlineIcon color={`${currPage === 2 ? colors.deleteRed : colors.amber950}`} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => bottomSheetRef.current.close()}>
        <CloseIcon color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default BottomSheetHeader;
