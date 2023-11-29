import React, { useRef, useState } from "react";
import TrackPlayerBottomSheet from "./TrackPlayerBottomSheet";
import BottomSheetMenu from "./BottomSheetMenu";
import usePlaylistColors from "hooks/usePlaylistColors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettingStore } from "@store/store-settings";
import { colors } from "@constants/Colors";

export type BottomSheetImpRef = {
  expand: () => void;
  close: () => void;
  setPage: (page: number) => void;
  snapToIndex: (index: number) => void;
};

const BottomSheetContainer = () => {
  const bottomSheetRef = useRef<BottomSheetImpRef | null>();
  const setBottomSheetRef = useSettingStore((state) => state.actions.setBottomSheetRef);
  const playlistColors = usePlaylistColors();
  const handleExpand = () => bottomSheetRef.current?.expand();
  const handleSetPage = (page: number) => bottomSheetRef.current?.setPage(page);
  const handleSnapToIndex = (index: number) => bottomSheetRef.current?.snapToIndex(index);

  React.useEffect(() => {
    if (bottomSheetRef.current) {
      setBottomSheetRef(bottomSheetRef.current);
    }
  }, [bottomSheetRef.current]);
  return (
    <>
      {/* <LinearGradient colors={[colors.amber50, `${playlistColors?.secondary?.color}`]}>
            <View className="h-5" />
          </LinearGradient> */}
      <SafeAreaView edges={["bottom"]}>
        <BottomSheetMenu
          isExpanded={false}
          setPage={handleSetPage}
          expand={handleExpand}
          snapToIndex={handleSnapToIndex}
        />
      </SafeAreaView>
      <TrackPlayerBottomSheet ref={bottomSheetRef} />
    </>
  );
};

export default BottomSheetContainer;
