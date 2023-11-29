import { View, Text, StyleSheet } from "react-native";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import BottomSheet, { useBottomSheetDynamicSnapPoints } from "@gorhom/bottom-sheet";
import { colors } from "@constants/Colors";
import PagerView, { PagerViewOnPageSelectedEvent } from "react-native-pager-view";
import TrackPlayerScrollerRateTimer from "../TrackPlayerScrollerRateTimer";
import TrackList from "../TrackList";
import { BottomSheetImpRef } from "./BottomSheetContainer";
import usePlaylistColors from "hooks/usePlaylistColors";
import BottomSheetHeader from "./BottomSheetHeader";
import BottomSheetsBookmarks from "./BottomSheetBookmarks";
import RateSelector from "./RateSelector";
import { LinearGradient } from "expo-linear-gradient";

type Ref = BottomSheetImpRef;
type Props = {};

const TrackPlayerBottomSheet = forwardRef<Ref, Props>((props, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const pagerRef = useRef<PagerView>();
  const bottomSheetRef = useRef<BottomSheet>();
  const playlistColors = usePlaylistColors();
  const [currPage, setCurrPage] = useState(0);
  // props.setPage((pageIndex) => {
  //   if (pagerRef?.current) {
  //     pagerRef.current.setPage(pageIndex);
  //   }
  // });
  const setPage = (pageIndex) => {
    if (pagerRef?.current) {
      pagerRef.current.setPage(pageIndex);
    }
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        expand() {
          bottomSheetRef.current?.expand();
        },
        close() {
          bottomSheetRef.current?.close();
        },
        snapToIndex(snapIndex: number) {
          bottomSheetRef.current?.snapToIndex(snapIndex);
        },
        setPage(page) {
          // console.log("PAGE", page);
          pagerRef.current?.setPage(page);
        },
      };
    },
    []
  );

  const snapPoints = ["85%"];
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(snapPoints);
  // console.log("animate", animatedContentHeight.value);
  const handlePageSelected = (e: PagerViewOnPageSelectedEvent) => {
    // console.log(e.nativeEvent.position);
    // Current page index
    setCurrPage(e.nativeEvent.position);
  };
  return (
    <BottomSheet
      ref={bottomSheetRef}
      handleComponent={() => (
        <BottomSheetHeader
          pagerRef={pagerRef}
          bottomSheetRef={bottomSheetRef}
          currPage={currPage}
        />
      )}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={{
        backgroundColor: colors.amber50,
        borderWidth: StyleSheet.hairlineWidth,

        // marginBottom: 50,
        // flex: 1,
      }}
      onChange={(index) => {
        if (index === 0) {
          setIsExpanded(false);
        } else {
          setIsExpanded(true);
        }
      }}
    >
      <View className="flex-1 mb-10">
        <LinearGradient
          // colors={[`${colorP.secondary}55`, `${colorP.background}55`]}
          colors={[`${playlistColors.gradientTop}`, playlistColors.gradientLast, colors.amber50]}
          style={{ flex: 1 }}
          // start={{ x: 0, y: 0 }}
          // end={{ x: 0, y: 0.95 }}
          locations={[0.1, 0.8, 1]}
        >
          <View>
            {/* <BottomSheetMenu
            isExpanded={isExpanded}
            setPage={setPage}
            expand={bottomSheetRef.current?.expand}
            snapToIndex={bottomSheetRef.current?.snapToIndex}
          /> */}
          </View>

          <PagerView
            style={{ flex: 1, width: "100%" }}
            orientation="horizontal"
            ref={pagerRef}
            onPageSelected={handlePageSelected}
          >
            <View key="1" className="flex-1">
              <TrackList />
            </View>
            <View key="2" className="mt-4">
              <RateSelector />
            </View>
            <View key="3">
              <BottomSheetsBookmarks />
            </View>
          </PagerView>
        </LinearGradient>
      </View>
      {/* <View>
        <Text>BOTTOM</Text>
      </View> */}
    </BottomSheet>
  );
});

export default TrackPlayerBottomSheet;
