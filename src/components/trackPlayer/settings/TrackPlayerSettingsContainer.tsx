import { View, Text, Image, TouchableOpacity } from "react-native";

import TrackPlayerSettingsRate from "./TrackPlayerSettingsRate";
import TrackPlayerSettingsTracks from "./TrackPlayerSettingsTracks";
import {
  usePlaybackStore,
  useTrackActions,
  useTracksStore,
} from "../../../store/store";
import { useEffect, useMemo, useState } from "react";
import TrackPlayerSettingsBookmarks from "./TrackPlayerSettingsBookmarks";
import { AnimateHeight } from "../../common/animations/AnimateHeight";
// const x = require("../../../../assets/littleapeaudio.png");

const TrackPlayerSettingsContainer = () => {
  const trackActions = useTrackActions();
  const currPlaylistId = usePlaybackStore((state) => state.currentPlaylistId);
  const [showTracks, setShowTrack] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  return (
    <View className="flex-1 flex-col m-1 items-center">
      <TrackPlayerSettingsRate />
      <TouchableOpacity
        onPress={() => setShowTrack((prev) => !prev)}
        className="flex-row justify-start w-full"
      >
        <Text className="text-lg ml-2 font-bold">Tracks</Text>
      </TouchableOpacity>
      <AnimateHeight key="tracks" hide={!showTracks} style={{ width: "100%" }}>
        <TrackPlayerSettingsTracks />
      </AnimateHeight>

      <TouchableOpacity
        onPress={() => setShowBookmarks((prev) => !prev)}
        className="flex-row justify-start w-full"
      >
        <Text className="text-lg ml-2 font-bold">Bookmarks</Text>
      </TouchableOpacity>
      <AnimateHeight hide={showBookmarks} style={{ width: "100%" }}>
        <TrackPlayerSettingsBookmarks />
      </AnimateHeight>
    </View>
  );
};

export default TrackPlayerSettingsContainer;
