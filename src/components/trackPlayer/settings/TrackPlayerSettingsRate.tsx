import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { usePlaybackStore } from "../../../store/store";
import TrackPlayer from "react-native-track-player";
import Slider from "@react-native-community/slider";
import { MotiView } from "moti";

const TrackPlayerSettingsRate = () => {
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
    <View className="flex-col">
      <Text className="ml-2 text-lg font-bold">Audio Speed:</Text>
      <View className="flex flex-col p-2 bg-white border border-amber-950 rounded-lg">
        <View className="flex-row justify-start space-x-2 w-full items-center mb-2">
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
          <MotiView
            from={{ scale: 1, translateX: 0 }}
            animate={{
              scale: isSliding ? 2 : 1,
              translateX: isSliding ? -35 : 0,
            }}
            exit={{ scale: 1 }}
            className="flex-row justify-end flex-grow mr-2"
          >
            <Text className="text-amber-900 text-lg">{rate.toFixed(2)}</Text>
          </MotiView>
        </View>
        <View className="flex-row w-full ">
          <Slider
            style={{ width: "100%" }}
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
