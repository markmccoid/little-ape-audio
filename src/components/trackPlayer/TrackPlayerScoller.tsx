import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import React from "react";
import TrackPlayerSettingsRate from "./settings/TrackPlayerSettingsRate";
import TrackPlayerSettingsSleepTimer from "./settings/TrackPlayerSettingsSleepTimer";
import { useCurrentPlaylist } from "@store/store";
import TrackPlayerScrollerRateTimer from "./TrackPlayerScrollerRateTimer";

const { width, height } = Dimensions.get("window");

const componentArray = [
  {
    component: ({ imageURI }) => (
      <Image
        source={{ uri: imageURI }}
        style={{
          width: width / 1.35,
          height: width / 1.35,
          // width: width - 100, //width / 1.35,
          // height: width - 100, // width / 1.35,
          resizeMode: "stretch",
          alignSelf: "center",
        }}
      />
    ),
    label: "",
  },
  {
    component: TrackPlayerScrollerRateTimer,
    label: "Audio Speed",
  },
];

const TrackPlayerScoller = () => {
  const playlist = useCurrentPlaylist();

  return (
    <FlatList
      data={componentArray}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={width - 80}
      style={{ width: width - 80 }}
      keyExtractor={(_, index) => index.toString()}
      decelerationRate="fast"
      // onScroll={handleScroll}
      renderItem={({ item, index }) => {
        const Comp = item.component;
        return (
          <View style={{ width: width - 80 }}>
            {index === 0 && <Comp imageURI={playlist?.imageURI} />}
            {index !== 0 && <Comp />}
            {/* {index !== 2 && flIndex === index && <Comp />}
          {index === 2 && flIndex === index && (
            <MotiView
              from={{ opacity: 0, height: 5 }}
              animate={{ opacity: 1, height: 135 }}
              // exit={{ height: 0 }}
              style={{ marginHorizontal: 8 }}
            >
              <Comp currPlaylistId={currPlaylistId} />
            </MotiView>
          )} */}
          </View>
        );
      }}
    >
      <Text>TrackPlayerScoller</Text>
    </FlatList>
  );
};

export default TrackPlayerScoller;
