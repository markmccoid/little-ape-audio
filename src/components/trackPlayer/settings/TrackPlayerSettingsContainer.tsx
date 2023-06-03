import { View, Text, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { usePlaybackStore } from "../../../store/store";
import TrackPlayer from "react-native-track-player";
import Slider from "@react-native-community/slider";
import TrackPlayerSettingsRate from "./TrackPlayerSettingsRate";
import TrackPlayerSettingsTracks from "./TrackPlayerSettingsTracks";
const x = require("../../../../assets/littleapeaudio.png");

const TrackPlayerSettingsContainer = () => {
  const playbackActions = usePlaybackStore((state) => state.actions);
  const playlistId = usePlaybackStore((state) => state.currentPlaylist);
  const queue = usePlaybackStore((state) => state.trackPlayerQueue);
  const actions = usePlaybackStore((state) => state.actions);
  const [rate, setRate] = useState<number>(1);

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
    <View className="flex flex-col m-1 items-center ">
      <TrackPlayerSettingsRate />
      <View className="flex-row justify-start w-full">
        <Text className="text-lg ml-2 font-bold">Tracks</Text>
      </View>
      <TrackPlayerSettingsTracks />
    </View>
  );
};

export default TrackPlayerSettingsContainer;
