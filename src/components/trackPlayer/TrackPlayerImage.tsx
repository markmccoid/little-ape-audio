import { View, Dimensions, TouchableOpacity } from "react-native";
import React from "react";
import PlaylistImage from "../common/PlaylistImage";
import { BackIcon, NextIcon } from "../common/svg/Icons";
import { colors } from "../../constants/Colors";
import { usePlaybackStore } from "../../store/store";

const { width, height } = Dimensions.get("window");

const TrackPlayerImage = () => {
  const actions = usePlaybackStore((state) => state.actions);
  return (
    <View className="flex-row justify-between items-center mx-1">
      <TouchableOpacity onPress={() => actions.prev()}>
        <BackIcon size={35} color={colors.amber800} />
      </TouchableOpacity>
      <PlaylistImage
        style={{
          width: width / 1.35,
          height: width / 1.35,
          resizeMode: "stretch",
          alignSelf: "center",
        }}
      />
      <TouchableOpacity onPress={() => actions.next()}>
        <NextIcon size={35} color={colors.amber800} />
      </TouchableOpacity>
    </View>
  );
};

export default TrackPlayerImage;
