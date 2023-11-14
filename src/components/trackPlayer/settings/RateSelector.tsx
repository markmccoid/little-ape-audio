import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";

import TrackPlayer from "react-native-track-player";
import Slider from "@react-native-community/slider";
import { MotiView } from "moti";
import { colors } from "@constants/Colors";
import { usePlaybackStore } from "@store/store";

const { width, height } = Dimensions.get("window");
const COMPONENT_WIDTH = width - 90;
const COMPONENT_PADDING = 10;

const RateSelector = () => {
  const playbackActions = usePlaybackStore((state) => state.actions);
  const [rate, setRate] = useState<number>(1);
  const [isSliding, setIsSliding] = useState(false);

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
    <View className="flex flex-col z-20">
      {/* <View className="flex flex-col p-2 mb-2 bg-amber-200 border border-amber-950 rounded-lg z-20"> */}
      {/* RATE COMPONENT */}
      <View className="flex-row justify-center space-x-1 w-full items-center mb-2">
        {fixedRates.map((el) => (
          <TouchableOpacity
            key={el}
            onPress={() => updateRate(el)}
            className={`px-2 py-1 rounded-md border border-amber-800 ${
              el === rate ? "bg-amber-300" : "bg-white"
            }`}
          >
            <Text>{el.toFixed(2)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-row justify-center">
        <Slider
          style={{
            width: COMPONENT_WIDTH - 40,
            paddingHorizontal: COMPONENT_PADDING,
          }}
          minimumTrackTintColor={colors.amber700}
          maximumTrackTintColor={colors.amber400}
          thumbTintColor={colors.amber600}
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

      <View className="flex-row justify-end">
        <MotiView
          from={{ scale: 1, translateX: 0, backgroundColor: "white" }}
          animate={{
            scale: isSliding ? 1.5 : 1,
            translateX: isSliding ? -10 : 0,
            translateY: isSliding ? 10 : 0,
            backgroundColor: isSliding ? colors.amber300 : "white",
          }}
          exit={{ scale: 1 }}
          className={`flex-row justify-end mr-2 rounded-lg border border-amber-900 ${
            isSliding ? "border border-amber-800 justify-center" : ""
          }`}
        >
          <Text className={`text-amber-900 text-lg px-2  ${isSliding ? "text-black" : ""}`}>
            {rate.toFixed(2)}
          </Text>
        </MotiView>
      </View>
    </View>
  );
};

export default RateSelector;
