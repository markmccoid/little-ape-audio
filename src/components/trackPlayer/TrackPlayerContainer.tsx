import { View, Text, StyleSheet, SafeAreaView, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import TrackPlayerControls from "./TrackPlayerControls";
import TrackPlayerProgressBar from "./TrackPlayerProgressBar";
import TrackPlayerImage from "./TrackPlayerImage";
import BottomSheetContainer from "./bottomSheet/BottomSheetContainer";
import { useCurrentPlaylist } from "@store/store";
import { colors } from "@constants/Colors";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const TrackPlayerContainer = () => {
  const playlist = useCurrentPlaylist();
  const [colorP, setColorP] = useState({ background: colors.amber600, secondary: colors.amber200 });

  useEffect(() => {
    if (playlist?.imageColors) {
      setColorP(playlist.imageColors);
    }
  }, [playlist]);

  return (
    <SafeAreaView className="flex-1 flex-col">
      <LinearGradient
        // colors={[`${colorP.secondary}55`, `${colorP.background}55`]}
        colors={[`${colorP.secondary}`, `${colorP.background}`, colors.amber50]}
        style={{}}
        // start={{ x: 0, y: 0 }}
        // end={{ x: 1, y: 1 }}
      >
        <View className="pb-5">
          <TrackPlayerImage />

          <TrackPlayerProgressBar />
        </View>
      </LinearGradient>
      <View className="flex-1">
        <TrackPlayerControls />
      </View>
      {/* <TrackList /> */}
      {/* <TrackPlayerBottomSheet /> */}
      <BottomSheetContainer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  actionButton: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 5,
  },
});
export default TrackPlayerContainer;
