import { View, Text, Dimensions } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import TrackPlayer, { useProgress } from "react-native-track-player";
import { getCurrentPlaylist, usePlaybackStore } from "../../store/store";
import { formatSeconds } from "../../utils/formatUtils";
import { colors } from "../../constants/Colors";
import { AnimatePresence, MotiView } from "moti";
import { Slider as NewSlider } from "@miblanchard/react-native-slider";
import usePlaylistColors from "hooks/usePlaylistColors";
import { getTextColor } from "@utils/otherUtils";

const { width, height } = Dimensions.get("window");
const leftOffset = (width - width / 2.25) / 2;

const TrackPlayerProgressBar = () => {
  const playbackActions = usePlaybackStore((state) => state.actions);
  const { position, duration } = useProgress();
  // const { position } = useMyProgress();
  const queuePos = usePlaybackStore((state) => state.currentQueuePosition);
  const queueDuration = getCurrentPlaylist()?.totalDurationSeconds;
  const [seeking, setSeeking] = useState<number>();
  const [isSeeking, setIsSeeking] = useState(false);
  const [currPos, setCurrPos] = useState(position);
  const currTrack = usePlaybackStore((state) => state.currentTrack);
  const currChapterInfo = usePlaybackStore((state) => state.currentChapterInfo);

  // const playlist = getCurrentPlaylist();
  const playlistColors = usePlaylistColors();
  const textColor = getTextColor(playlistColors.background.colorLuminance); //"black";

  useEffect(() => {
    if (isSeeking) {
      setCurrPos(seeking);
    } else {
      setCurrPos(position);
    }
  }, [position, seeking]);

  // console.log("chapter ", currTrack.chapters.find((el) => currPos < el.endSeconds)?.title, currPos);

  async function handleChange(valueArr: number[]) {
    let value = valueArr[0];
    if (value < 0) value = 0;
    await playbackActions.seekTo(value);
    setIsSeeking(false);
  }

  if (currChapterInfo?.startSeconds !== undefined) return null;

  return (
    <View className="flex-col justify-center items-center mt-3 mb-4">
      {/* POP UP Seeking View Absolute positions */}
      <AnimatePresence>
        {isSeeking && (
          <MotiView
            className="bg-amber-200 rounded-xl p-2 absolute z-10 opacity-80 border
              border-amber-700"
            style={{
              width: width / 2.25,
              left: leftOffset,
              top: -150,
            }}
            from={{
              opacity: 0,
              scale: 0,
            }}
            animate={{
              opacity: 0.9,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0,
            }}
            exitTransition={{
              type: "timing",
              duration: 500,
            }}
          >
            <Text
              className="text-lg font-bold"
              style={{ opacity: 1, zIndex: 11, textAlign: "center" }}
            >
              {formatSeconds(seeking)}
            </Text>
          </MotiView>
        )}
      </AnimatePresence>
      <View>
        <Text
          className="text-base text-center "
          style={{ width: width / 1.25, color: textColor }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {`${currTrack.trackNum || ""} ${currTrack.title}`}
        </Text>
      </View>
      {/* NEED something to indicate what is seeking so */}
      {/* <NewSlider
        containerStyle={{
          width: width - 20,
        }}
        minimumValue={0}
        maximumValue={currChapterInfo.endSeconds - currChapterInfo.startSeconds}
        minimumTrackTintColor={colors.amber700}
        maximumTrackTintColor={colors.amber400}
        thumbTintColor={colors.amber600}
        value={currPos - chapterProgressOffset} // {seeking ? seeking : Math.floor(position)}
        onValueChange={(val) => {
          setIsSeeking(true);
          console.log("VAl", val, chapterProgressOffset);
          setSeeking(val[0] + chapterProgressOffset);
        }}
        onSlidingComplete={(val) => handleChange([val[0] + chapterProgressOffset])}
        step={1}
      /> */}

      <NewSlider
        containerStyle={{
          width: width - 20,
        }}
        minimumValue={0}
        maximumValue={duration}
        minimumTrackTintColor={colors.amber700}
        maximumTrackTintColor={colors.amber400}
        thumbTintColor={colors.amber600}
        value={currPos} // {seeking ? seeking : Math.floor(position)}
        onValueChange={(val) => {
          setIsSeeking(true);
          setSeeking(val[0]);
        }}
        onSlidingComplete={handleChange}
        step={1}
      />

      {/* <Slider
        style={{
          width: width - 20,
        }}
        minimumValue={0}
        maximumValue={duration}
        minimumTrackTintColor={colors.amber700}
        maximumTrackTintColor={colors.amber400}
        thumbTintColor={colors.amber600}
        value={Math.floor(position)}
        onValueChange={(val) => {
          setSeeking(val);
        }}
        onSlidingComplete={handleChange}
        step={1}
        // onSlidingStart={() => soundActions.pause()}
        // onSlidingComplete={(val) => soundActions.updatePosition(val)}
      /> */}
      <View className="flex-row w-full px-1 justify-between mt-[-5]">
        <Text className="font-semibold text-xs" style={{ color: textColor }}>
          {formatSeconds(Math.floor(position))}
        </Text>
        <Text className="font-semibold text-xs" style={{ color: textColor }}>
          {formatSeconds(Math.floor(position + queuePos))} of{" "}
          {formatSeconds(Math.floor(queueDuration))}
        </Text>
        <Text className="font-semibold" style={{ color: textColor }}>
          {formatSeconds(Math.floor(duration))}
        </Text>
      </View>
    </View>
  );
};

export default TrackPlayerProgressBar;
