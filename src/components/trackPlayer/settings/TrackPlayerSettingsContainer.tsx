import { View, Text, Image, TouchableOpacity } from "react-native";

import TrackPlayerSettingsRate from "./TrackPlayerSettingsRate";
import TrackPlayerSettingsTracks from "./TrackPlayerSettingsTracks";
// const x = require("../../../../assets/littleapeaudio.png");

const TrackPlayerSettingsContainer = () => {
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
