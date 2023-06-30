import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Dimensions,
  Alert,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { usePlaybackStore } from "../../store/store";
import {
  BookmarkIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
} from "../common/svg/Icons";
import { Event, State } from "react-native-track-player";
import { useSettingStore } from "../../store/store-settings";
import { colors } from "../../constants/Colors";
import { SpinnerForwardIcon } from "../common/svg/Icons";
import { formatSeconds } from "../../utils/formatUtils";

const { width, height } = Dimensions.get("window");

type Props = {
  style?: ViewStyle;
};
const CONTROLSIZE = 35;
const CONTROLCOLOR = colors.amber800;

const TrackPlayerControls = ({ style }: Props) => {
  const jumpSecondsForward = useSettingStore(
    (state) => state.jumpForwardSeconds
  );
  const jumpSecondsBackward = useSettingStore(
    (state) => state.jumpBackwardSeconds
  );
  const playbackActions = usePlaybackStore((state) => state.actions);

  // const [playerState, setPlayerState] = useState(null);
  const playerState = usePlaybackStore((state) => state.playerState);
  const isPlaylistLoaded = usePlaybackStore((state) => state.playlistLoaded);
  const currentTrack = usePlaybackStore((state) => state.currentTrack);
  const [bookmarkLength, setBookmarkLength] = useState<number>();
  const isPlaying = playerState === State.Playing;

  // Set bookmark number once on load
  // Then if bookmark added, it will update in handleAddBookmark
  useEffect(() => {
    const bookmarks = playbackActions.getBookmarks();
    setBookmarkLength(bookmarks?.length);
  }, []);

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
            setBookmarkLength((prev) => (prev ? prev + 1 : 1));
          },
        },
        { text: "Cancel", onPress: () => {} },
      ]
    );
  };

  return (
    <View className="flex-col justify-center items-center ">
      <Text
        className="text-sm text-center py-2"
        style={{ width: width / 1.25 }}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {currentTrack?.title}
      </Text>
      <View className="flex-row w-full justify-between items-center">
        <View className="flex-row  items-center justify-center flex-grow ml-[55]">
          {/* SEEK BACK */}
          <TouchableOpacity
            onPress={() => playbackActions.jumpBack(jumpSecondsBackward)}
            className="mx-3"
          >
            <SpinnerForwardIcon
              size={CONTROLSIZE}
              color={CONTROLCOLOR}
              style={{
                transform: [
                  { rotateZ: "-45deg" },
                  { rotateY: "180deg" },
                  { scale: 1.1 },
                ],
              }}
            />
            {/* <Text style={{ position: "absolute", bottom: -10, left: 12 }}> */}
            <Text
              style={{
                position: "absolute",
                bottom: 8,
                left: 11,
                color: colors.amber950,
              }}
            >
              {jumpSecondsBackward}
            </Text>
          </TouchableOpacity>
          {/* PLAY/PAUSE */}
          <TouchableOpacity
            onPress={isPlaying ? () => pause() : () => play()}
            style={styles.actionButton}
            className="mx-3"
          >
            <View>
              {!isPlaying ? (
                <PlayIcon size={CONTROLSIZE} color={CONTROLCOLOR} />
              ) : (
                <PauseIcon size={CONTROLSIZE} color={CONTROLCOLOR} />
              )}
            </View>
          </TouchableOpacity>
          {/* SEEK FORWARD */}
          <TouchableOpacity
            onPress={() => playbackActions.jumpForward(jumpSecondsForward)}
            className="mx-3"
          >
            <SpinnerForwardIcon
              size={CONTROLSIZE}
              color={CONTROLCOLOR}
              style={{ transform: [{ rotateZ: "45deg" }, { scale: 1.1 }] }}
            />
            {/* <Text style={{ position: "absolute", bottom: -10, right: 12 }}> */}
            <Text
              style={{
                position: "absolute",
                bottom: 8,
                right: 11,
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
