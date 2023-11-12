import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Dimensions,
  Alert,
  Pressable,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { getCurrentPlaylist, usePlaybackStore, useTracksStore } from "../../store/store";
import { BookmarkIcon, PauseIcon, PlayIcon, RewindIcon } from "../common/svg/Icons";
import { State } from "react-native-track-player";
import { useSettingStore } from "../../store/store-settings";
import { colors } from "../../constants/Colors";
import { SpinnerForwardIcon } from "../common/svg/Icons";
import { formatSeconds } from "../../utils/formatUtils";
import { AnimatePresence, MotiView } from "moti";
import usePlaylistColors from "hooks/usePlaylistColors";

const { width, height } = Dimensions.get("window");

type Props = {
  style?: ViewStyle;
};
const CONTROLSIZE = 45;

const TrackPlayerControls = ({ style }: Props) => {
  const jumpSecondsForward = useSettingStore((state) => state.jumpForwardSeconds);
  const jumpSecondsBackward = useSettingStore((state) => state.jumpBackwardSeconds);
  const playbackActions = usePlaybackStore((state) => state.actions);

  // const [playerState, setPlayerState] = useState(null);
  const playerState = usePlaybackStore((state) => state.playerState);
  const isPlaylistLoaded = usePlaybackStore((state) => state.playlistLoaded);
  const pl = useTracksStore((state) => state.playlists);
  const currentTrack = usePlaybackStore((state) => state.currentTrack);
  const [bookmarkLength, setBookmarkLength] = useState<number>();
  const isPlaying = playerState === State.Playing;
  const playlist = getCurrentPlaylist();

  const playlistColors = usePlaylistColors();
  // If textColor returned is light, then we know background color is dark enough to use
  // for controls, otherwise use default
  const CONTROLCOLOR =
    playlistColors?.background?.colorType === "dark"
      ? playlistColors.background?.color
      : playlistColors?.secondary?.colorType === "dark"
      ? playlistColors.secondary?.color
      : "black";

  // Set bookmark number once on load
  // Then if bookmark added, it will update in handleAddBookmark
  useEffect(() => {
    const bookmarks = playbackActions.getBookmarks();
    setBookmarkLength(bookmarks?.length === 0 ? undefined : bookmarks?.length);
  }, [pl]);

  //~ --- ----
  const play = async () => {
    await playbackActions.play();
  };
  const pause = async () => {
    playbackActions.pause();
  };

  if (!isPlaylistLoaded) {
    return null;
  }

  const handleAddBookmark = () => {
    const currTrackPos = playbackActions.getCurrentTrackPosition();
    Alert.prompt(
      "Enter Bookmark Name",
      "Enter a name for the bookmark at " + formatSeconds(currTrackPos),
      [
        {
          text: "OK",
          onPress: (bookmarkName) => {
            playbackActions.addBookmark(bookmarkName, currTrackPos);
            const bookmarks = playbackActions.getBookmarks();

            setBookmarkLength(bookmarks?.length);
          },
        },
        { text: "Cancel", onPress: () => {} },
      ]
    );
  };

  return (
    <View className="flex-col justify-center items-center">
      {/* <Text
        className="text-sm text-center py-2"
        style={{ width: width / 1.25 }}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {currentTrack?.title}
      </Text> */}
      <View className="flex-row w-full justify-between items-center">
        <View className="flex-row  items-center justify-center flex-grow ml-[55]">
          {/* SEEK BACK */}
          <TouchableOpacity
            onPress={() => playbackActions.jumpBack(jumpSecondsBackward)}
            className="mx-3 relative justify-center items-center"
          >
            <SpinnerForwardIcon
              size={CONTROLSIZE}
              color={CONTROLCOLOR}
              style={{
                transform: [{ rotateZ: "-0deg" }, { rotateY: "180deg" }, { scale: 1.1 }],
              }}
            />
            {/* <Text style={{ position: "absolute", bottom: -10, left: 12 }}> */}
            <Text
              style={{
                position: "absolute",
                paddingTop: 2,
                color: colors.amber950,
              }}
            >
              {jumpSecondsBackward}
            </Text>
          </TouchableOpacity>
          {/* PLAY/PAUSE */}
          <Pressable
            onPress={isPlaying ? () => pause() : () => play()}
            style={styles.actionButton}
            className="mx-3"
          >
            <AnimatePresence>
              <View
                className="relative "
                style={{
                  width: CONTROLSIZE,
                  height: CONTROLSIZE,
                }}
              >
                {!isPlaying && (
                  <MotiView
                    key={1}
                    className="absolute"
                    from={{
                      opacity: 0.2,
                      transform: [
                        { rotateZ: isPlaying ? "0deg" : "-50deg" },
                        { scale: isPlaying ? 1 : 0.7 },
                      ],
                    }}
                    animate={{
                      opacity: isPlaying ? 0 : 1,
                      transform: [
                        { rotateZ: isPlaying ? "-50deg" : "0deg" },
                        { scale: isPlaying ? 0.7 : 1 },
                      ],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "timing", duration: 500 }}
                  >
                    <PlayIcon size={CONTROLSIZE + 5} color={CONTROLCOLOR} />
                  </MotiView>
                )}
                {isPlaying && (
                  <MotiView
                    key={3}
                    className="absolute"
                    from={{
                      opacity: 0.2,
                      transform: [
                        { rotateZ: isPlaying ? "50deg" : "0deg" },
                        { scale: isPlaying ? 0.7 : 1 },
                      ],
                    }}
                    animate={{
                      opacity: isPlaying ? 1 : 0,
                      transform: [
                        { rotateZ: isPlaying ? "0deg" : "50deg" },
                        { scale: isPlaying ? 1 : 0.7 },
                      ],
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "timing", duration: 500 }}
                  >
                    <PauseIcon size={CONTROLSIZE + 5} color={CONTROLCOLOR} />
                  </MotiView>
                )}
              </View>
            </AnimatePresence>
          </Pressable>
          {/* SEEK FORWARD */}
          <TouchableOpacity
            onPress={() => playbackActions.jumpForward(jumpSecondsForward)}
            className="mx-3 relative flex justify-center items-center"
          >
            <SpinnerForwardIcon
              size={CONTROLSIZE}
              color={CONTROLCOLOR}
              style={{ transform: [{ scale: 1.1 }] }}
            />
            {/* <Text style={{ position: "absolute", bottom: -10, right: 12 }}> */}
            <Text
              style={{
                position: "absolute",
                paddingTop: 2,
                // bottom: 8,
                // right: 11,
                color: colors.amber950,
              }}
            >
              {jumpSecondsForward}
            </Text>
          </TouchableOpacity>
        </View>
        {/* BOOKMARK */}
        <TouchableOpacity onPress={handleAddBookmark} className="mr-10 ">
          {bookmarkLength && (
            <View
              className="z-30 flex-row justify-center items-center absolute 
          w-[18] h-[18] rounded-lg bg-green-600 border-green-800 border top-[-5] right-[-6]"
            >
              <Text className="z-20 text-white text-xs ">{bookmarkLength}</Text>
            </View>
          )}
          <BookmarkIcon size={CONTROLSIZE} color={CONTROLCOLOR} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  actionButton: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    // borderWidth: 1,
    // borderRadius: 5,
  },
});

export default TrackPlayerControls;
