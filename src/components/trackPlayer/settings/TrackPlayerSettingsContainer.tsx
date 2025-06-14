import { View, Text, TouchableOpacity, Dimensions, Pressable, Alert } from "react-native";

import TrackPlayerSettingsTracks from "./TrackPlayerSettingsTracks";

import { useEffect, useMemo, useRef, useState } from "react";
import TrackPlayerSettingsBookmarks from "./TrackPlayerSettingsBookmarks";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import TPSettingsScroller from "./TPSettingsScroller";
import usePlaylistColors from "hooks/usePlaylistColors";
import TrackPlayerSettingsHeader from "./TrackPlayerSettingsHeader";
import { SymbolView } from "expo-symbols";
import { usePlaybackStore, useTrackActions, useTracksStore } from "@store/store";

const { width, height } = Dimensions.get("window");
const COMPONENT_WIDTH = width - 20;
const COMPONENT_PADDING = 10;

const TrackPlayerSettingsContainer = () => {
  const [showItem, setShowItem] = useState<"bookmarks" | "tracks">("bookmarks");
  const { gradientTop, gradientMiddle, gradientLast } = usePlaylistColors();
  const plId = usePlaybackStore((state) => state.currentPlaylistId);
  const plSource = useTracksStore((state) => state.playlists[plId].source);
  const playlistColors = usePlaylistColors();
  const actions = useTrackActions();

  return (
    <>
      <TrackPlayerSettingsHeader />
      <LinearGradient
        // colors={[`${colorP.secondary}55`, `${colorP.background}55`]}
        colors={[`${gradientTop}`, gradientLast]}
        style={{ flex: 1 }}
        // start={{ x: 0, y: 0 }}
        // end={{ x: 0, y: 0.95 }}
        locations={[0.6, 1]}
      >
        <View className="flex-1 flex-col items-center justify-start">
          <View className="flex-row">
            <TPSettingsScroller />
          </View>
          {/* TRACKS and BOOKMARKS Buttons */}
          <View className="flex-1 flex-col items-center justify-start w-full">
            <View className="flex-row justify-between w-full mt-3 mb-2 pr-4">
              <View className="flex-row gap-2 items-center">
                <TouchableOpacity
                  onPress={() => setShowItem("bookmarks")}
                  className="flex-col justify-center items-center"
                >
                  <Text
                    className={`text-lg ml-2 font-semibold ${
                      showItem === "bookmarks" ? "opacity-100 font-bold" : "opacity-40"
                    }`}
                    style={{
                      color: playlistColors.gradientTopText,
                    }}
                  >
                    Bookmarks
                  </Text>
                  <MotiView
                    from={{ opacity: 1 }}
                    animate={{ opacity: showItem === "bookmarks" ? 1 : 0 }}
                    className="h-[5] w-[75]"
                    style={{ backgroundColor: playlistColors.gradientTopText }}
                  />
                </TouchableOpacity>

                {plSource === "abs" && (
                  <MotiView
                    from={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: showItem === "bookmarks" ? 1 : 0,
                      scale: showItem === "bookmarks" ? 1 : 0.5,
                    }}
                    transition={{ type: "timing", duration: 300 }}
                  >
                    <Pressable
                      className={`flex-row items-center active:scale-95 ${
                        showItem === "bookmarks" ? "opacity-100" : "opacity-40"
                      }`}
                      disabled={showItem !== "bookmarks"}
                      onPress={async () => {
                        await actions.mergeABSBookmarks();
                        Alert.alert("Synced", "Bookmarks synced successfully");
                      }}
                    >
                      <SymbolView
                        name="arrow.trianglehead.2.clockwise.rotate.90.circle.fill"
                        tintColor={playlistColors.gradientTopText}
                        size={25}
                      />
                      <Text
                        className="text-xs"
                        style={{
                          color: playlistColors.gradientTopText,
                        }}
                      >
                        Sync
                      </Text>
                    </Pressable>
                  </MotiView>
                )}
              </View>
              {/* TRACKS Button */}
              <TouchableOpacity
                onPress={() => setShowItem("tracks")}
                className="flex-col justify-center items-center "
              >
                <Text
                  className={`text-lg font-semibold ${
                    showItem === "tracks" ? "opacity-100 font-bold" : "opacity-40"
                  }`}
                  style={{
                    color: playlistColors.gradientTopText,
                  }}
                >
                  Tracks
                </Text>
                <MotiView
                  from={{ opacity: 1 }}
                  animate={{ opacity: showItem === "tracks" ? 1 : 0 }}
                  className="h-[5] w-[55]"
                  style={{ backgroundColor: playlistColors.gradientTopText }}
                />
              </TouchableOpacity>
            </View>
            {showItem === "tracks" && (
              <MotiView
                key="a"
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  type: "timing",
                  duration: 500,
                }}
                className="px-2 flex-1"
                style={{ flex: 1, width: "100%" }}
              >
                <TrackPlayerSettingsTracks />
              </MotiView>
            )}
            {showItem === "bookmarks" && (
              <MotiView
                key="b"
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  type: "timing",
                  duration: 500,
                }}
                className="w-full px-2 flex-1"
              >
                <TrackPlayerSettingsBookmarks />
              </MotiView>
            )}
          </View>
        </View>
      </LinearGradient>
    </>
  );
};

export default TrackPlayerSettingsContainer;
