import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { usePlaybackStore } from "../../../store/store";
import TrackPlayer from "react-native-track-player";
import Slider from "@react-native-community/slider";
import { MotiView } from "moti";
import { colors } from "../../../constants/Colors";
import usePlaylistColors from "hooks/usePlaylistColors";
import { lightenColor } from "@utils/otherUtils";

const { width, height } = Dimensions.get("window");
const COMPONENT_WIDTH = width - 20;
const COMPONENT_PADDING = 10;

const TrackPlayerSettingsRate = () => {
  const playbackActions = usePlaybackStore((state) => state.actions);
  const [rate, setRate] = useState<number>(1);
  const [isSliding, setIsSliding] = useState(false);
  const playlistColors = usePlaylistColors();

  // const bgTextColor = plColors.background.tintColor;
  // const bgColor = plColors.background.color;
  // const btnTextColor = plColors.secondary.tintColor;
  // const btnbgColor = plColors.secondary.color;
  // const trackRightColor = lightenColor(plColors.secondary.color, 75);

  useEffect(() => {
    const getRate = async () => {
      const rate = await TrackPlayer.getRate();
      setRate(rate);
    };
    getRate();
  }, []);

  const updateRate = async (newRate: number) => {
    setRate(newRate);
    playbackActions.updatePlaybackRate(newRate);
  };

  const fixedRates = [1, 1.25, 1.5, 1.75, 2];

  return (
    <View style={{ width: width, paddingHorizontal: COMPONENT_PADDING }}>
      {/* <Text className="ml-2 text-lg font-bold">Audio Speed:</Text> */}
      <View
        className="flex flex-col p-2 bg-white border border-amber-950 rounded-lg"
        style={{ backgroundColor: playlistColors.bg }}
      >
        <View className="flex-row justify-start space-x-2 w-full items-center mb-2">
          {fixedRates.map((el) => (
            <TouchableOpacity
              key={el}
              onPress={() => updateRate(el)}
              className={`px-2 py-1 rounded-md border border-amber-800 ${
                el === rate ? "bg-amber-300" : "bg-white"
              }`}
              style={{ backgroundColor: playlistColors.btnBg }}
            >
              <Text allowFontScaling={false} style={{ color: playlistColors.btnText }}>
                {el.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))}
          <View className="flex-grow flex-row justify-end">
            <MotiView
              from={{ scale: 1, translateX: 0, backgroundColor: "white" }}
              animate={{
                scale: isSliding ? 2 : 1,
                translateX: isSliding ? -15 : 0,
                translateY: isSliding ? 5 : 0,
                backgroundColor: isSliding ? colors.amber300 : "white",
              }}
              exit={{ scale: 1 }}
              className={`px-2  mr-2 rounded-lg z-20 ${
                isSliding ? "border border-amber-800 justify-center" : ""
              }`}
            >
              <Text
                allowFontScaling={false}
                className={`text-amber-900 text-lg ${isSliding ? "text-black" : ""}`}
              >
                {rate.toFixed(2)}
              </Text>
            </MotiView>
          </View>
        </View>
        <View className="flex-row w-full ">
          <Slider
            style={{ width: "100%" }}
            minimumTrackTintColor={playlistColors.sliderMinTrack}
            maximumTrackTintColor={playlistColors.sliderMaxTrack}
            thumbTintColor={playlistColors.sliderThumb}
            // minimumTrackTintColor={colors.amber700}
            // maximumTrackTintColor={colors.amber400}
            // thumbTintColor={colors.amber600}
            minimumValue={50}
            maximumValue={400}
            step={5}
            tapToSeek
            value={rate * 100}
            onValueChange={(val) => {
              setRate(val / 100);
            }}
            onSlidingStart={() => setIsSliding(true)}
            onSlidingComplete={(val) => {
              updateRate(val / 100);
              setIsSliding(false);
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default TrackPlayerSettingsRate;
