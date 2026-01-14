import React, { useRef, useState } from "react";
import TrackPlayerBottomSheet from "./TrackPlayerBottomSheet";
import BottomSheetMenu from "./BottomSheetMenu";
// import AddEditBookmark from "../AddEditBookmark";
import usePlaylistColors from "hooks/usePlaylistColors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettingStore } from "@store/store-settings";
import { colors } from "@constants/Colors";
import { useUIActions } from "@store/store-ui";

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

  /* const [bookmarkModalVisible, setBookmarkModalVisible] = useState(false);
  const [newBookmarkPos, setNewBookmarkPos] = useState<number | undefined>();
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | undefined>();
  const [playlistId, setPlaylistId] = useState<string | undefined>(); */

  const uiActions = useUIActions();

  const handleOpenBookmarkModal = (bookmarkId?: string, playlistId?: string, pos?: number) => {
    uiActions.openBookmarkModal({ bookmarkId, playlistId, position: pos });
  };

  const handleOpenAddBookmarkModal = (pos?: number) => {
    handleOpenBookmarkModal(undefined, undefined, pos);
  };
  /* const handleCloseBookmarkModal = () => {
    setBookmarkModalVisible(false);
    setEditingBookmarkId(undefined);
    setPlaylistId(undefined);
  }; */

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
          onAddBookmark={handleOpenAddBookmarkModal}
        />
      </SafeAreaView>
      <TrackPlayerBottomSheet ref={bottomSheetRef} />
    </>
  );
};

export default BottomSheetContainer;
