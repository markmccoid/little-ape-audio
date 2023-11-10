import { View, Text, TouchableOpacity } from "react-native";
import React, { useReducer, useState } from "react";
import { ListIcon, SpeedIcon } from "@components/common/svg/Icons";
import { useBottomSheet } from "@gorhom/bottom-sheet";

type Props = {
  isExpanded: boolean;
  setPage: (index: number) => void;
  snapToIndex: (index: number) => void;
  expand: () => void;
};
const BottomSheetMenu = ({ isExpanded, setPage, expand, snapToIndex }: Props) => {
  // const { expand, collapse } = useBottomSheet();

  return (
    <View className="flex-row justify-between px-4">
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
        <SpeedIcon />
      </TouchableOpacity>
      {/* <Text>BottomSheetMenu</Text> */}
    </View>
  );
};

export default BottomSheetMenu;
