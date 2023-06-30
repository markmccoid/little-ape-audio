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
  const [showTracks, setShowTrack] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showItem, setShowItem] = useState<"bookmarks" | "tracks">("bookmarks");
  return (
    <View className="flex-1 flex-col m-1 items-center">
      <TrackPlayerSettingsRate />

      {/* TRACKS and BOOKMARKS Buttons */}
      <View className="flex-row justify-between w-full mt-3 mb-2 pr-4">
        <TouchableOpacity onPress={() => setShowItem("bookmarks")}>
          <Text
            className={`text-lg ml-2 font-semibold ${
              showItem === "bookmarks" ? "text-amber-600 font-bold" : ""
            }`}
          >
            Bookmarks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowItem("tracks")}>
          <Text
            className={`text-lg ml-2 font-bold ${
              showItem === "tracks" ? "text-amber-600 font-bold" : ""
            }`}
          >
            Tracks
          </Text>
        </TouchableOpacity>
      </View>

      <AnimateHeight
        key="tracks"
        hide={showItem !== "tracks"}
        style={{ width: "100%" }}
      >
        <TrackPlayerSettingsTracks />
      </AnimateHeight>

      <AnimateHeight hide={showItem !== "bookmarks"} style={{ width: "100%" }}>
        <TrackPlayerSettingsBookmarks />
      </AnimateHeight>
    </View>
  );
};

export default TrackPlayerSettingsContainer;
