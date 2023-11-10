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
import BottomSheetMenu from "./BottomSheetMenu";
import { colors } from "@constants/Colors";
import TrackPlayerScoller from "../TrackPlayerScoller";
import PagerView from "react-native-pager-view";
import TrackPlayerScrollerRateTimer from "../TrackPlayerScrollerRateTimer";
import TrackList from "../TrackList";
import { BottomSheetImpRef } from "./BottomSheetContainer";
import { ListIcon, SpeedIcon } from "@components/common/svg/Icons";
import { TouchableOpacity } from "react-native-gesture-handler";

type Ref = BottomSheetImpRef;
type Props = {};

const TrackPlayerBottomSheet = forwardRef<Ref, Props>((props, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const pagerRef = useRef<PagerView>();
  const bottomSheetRef = useRef<BottomSheet>();
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

  const snapPoints = ["75%", "100%"];
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(snapPoints);
  // console.log("animate", animatedContentHeight.value);
  return (
    <BottomSheet
      ref={bottomSheetRef}
      handleComponent={() => (
        <View
          className="flex-row justify-between px-4 py-2"
          style={{ borderBottomWidth: StyleSheet.hairlineWidth }}
        >
          <TouchableOpacity onPress={() => pagerRef.current.setPage(0)}>
            <ListIcon />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => pagerRef.current.setPage(1)}>
            <SpeedIcon />
          </TouchableOpacity>
        </View>
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
        <View>
          {/* <BottomSheetMenu
            isExpanded={isExpanded}
            setPage={setPage}
            expand={bottomSheetRef.current?.expand}
            snapToIndex={bottomSheetRef.current?.snapToIndex}
          /> */}
        </View>

        <PagerView
          style={{ flex: 1, width: "100%", marginBottom: 150 }}
          orientation="horizontal"
          ref={pagerRef}
        >
          <View key="1" className="flex-1">
            <TrackList />
          </View>
          <View key="2">
            <TrackPlayerScrollerRateTimer />
          </View>
        </PagerView>
      </View>
      {/* <View>
        <Text>BOTTOM</Text>
      </View> */}
    </BottomSheet>
  );
});

export default TrackPlayerBottomSheet;
