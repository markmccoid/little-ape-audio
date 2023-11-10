import { View, Text } from "react-native";
import React, { useRef, useState } from "react";
import TrackPlayerBottomSheet from "./TrackPlayerBottomSheet";
import BottomSheetMenu from "./BottomSheetMenu";

export type BottomSheetImpRef = {
  expand: () => void;
  close: () => void;
  setPage: (page: number) => void;
  snapToIndex: (index: number) => void;
};

const BottomSheetContainer = () => {
  const bottomSheetRef = useRef<BottomSheetImpRef | null>();

  const handleExpand = () => bottomSheetRef.current?.expand();
  const handleSetPage = (page: number) => bottomSheetRef.current?.setPage(page);
  const handleSnapToIndex = (index: number) => bottomSheetRef.current?.snapToIndex(index);

  return (
    <>
      <View className="py-3">
        <BottomSheetMenu
          isExpanded={false}
          setPage={handleSetPage}
          expand={handleExpand}
          snapToIndex={handleSnapToIndex}
        />
      </View>
      <TrackPlayerBottomSheet ref={bottomSheetRef} />
    </>
  );
};

export default BottomSheetContainer;
