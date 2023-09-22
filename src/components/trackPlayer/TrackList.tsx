import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Button,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { usePlaybackStore } from "../../store/store";
import { formatSeconds } from "../../utils/formatUtils";
import TrackPlayer, { useProgress } from "react-native-track-player";
import { colors } from "../../constants/Colors";
import { ApeTrack } from "../../store/types";
import { ToTopIcon } from "@components/common/svg/Icons";

const { width, height } = Dimensions.get("window");
const TrackList = () => {
  const queue = usePlaybackStore((state) => state.trackPlayerQueue);
  const currentTrack = usePlaybackStore((state) => state.currentTrack);
  const isPlaylistLoaded = usePlaybackStore((state) => state.playlistLoaded);
  const currentTrackIndex = usePlaybackStore((state) => state.currentTrackIndex);
  const playbackActions = usePlaybackStore((state) => state.actions);
  const { position, duration } = useProgress();
  const scrollViewRef = useRef(null);

  // Scroll to the active track
  const scrollToRow = (rowIndex) => {
    if (!scrollViewRef.current) return;
    scrollViewRef.current.scrollTo({
      x: 0,
      y: rowIndex * 55 - 1, // Assuming each row has a height of 55 and 1 border
      animated: true,
    });
  };

  useEffect(() => {
    scrollToRow(currentTrackIndex);
  }, [currentTrackIndex, scrollViewRef.current]);

  if (!isPlaylistLoaded) {
    return null;
  }
  return (
    <View className="flex-1" style={{ borderWidth: 1, borderColor: colors.amber500 }}>
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, marginBottom: 40, paddingBottom: 10 }}
        contentContainerStyle={{ paddingBottom: 2 }}
        // className="border border-amber-600"
      >
        {queue?.map((el, index) => {
          const isCurrentTrack = currentTrack.id === el.id;
          const hasChapters = !!el?.chapters;
          return (
            <View key={el.id}>
              <TouchableOpacity
                key={el.id}
                onPress={() => {
                  if (!isCurrentTrack) {
                    playbackActions.goToTrack(index);
                  }
                }}
                className=""
              >
                <View
                  key={el.url}
                  className={`p-2 ${index === 0 ? "border" : "border-b"} border-amber-500 h-[55] ${
                    currentTrack?.id === el.id ? "bg-amber-200" : "bg-white"
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="text-sm font-semibold flex-1 flex-grow"
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      // style={{ width: width / 1.2 }}
                    >{`${(index + 1).toString().padStart(2, "0")} - ${el.title}`}</Text>
                    <View style={{ width: 75 }} className="flex-row justify-end">
                      <Text className="text-xs">
                        {isCurrentTrack
                          ? formatSeconds(el.duration - position)
                          : formatSeconds(el.duration)}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="text-xs"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >{`${el.filename}`}</Text>
                    {/* <Text className="text-xs">id3 track - {el.trackNum}</Text> */}
                  </View>
                </View>
              </TouchableOpacity>
              {hasChapters &&
                el.chapters.map((chapt) => (
                  <ChapterRow
                    key={chapt.title}
                    isCurrentTrack={isCurrentTrack}
                    playbackActions={playbackActions}
                    chapt={chapt}
                    trackIndex={index}
                    progress={position}
                  />
                ))}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default TrackList;

const ChapterRow = ({ isCurrentTrack, playbackActions, chapt, trackIndex, progress }) => {
  const [isCurrChapter, setIsCurrChapter] = useState(
    progress <= chapt.endSeconds && progress >= chapt.startSeconds
  );
  // const isCurrChapter = progress <= chapt.endSeconds && progress >= chapt.startSeconds;
  // console.log("chapter test", chapt.startSeconds, chapt.endSeconds, progress, isCurrChapter);
  // For each chapter, check every second where we are at in the chapter.
  useEffect(() => {
    setIsCurrChapter(progress <= chapt.endSeconds && progress >= chapt.startSeconds);
  }, [progress]);

  return (
    <View
      className={`flex-row ml-4 border-b border-l border-amber-600 ${
        isCurrChapter ? "bg-amber-500" : "bg-amber-100"
      }`}
    >
      <TouchableOpacity
        onPress={async () => {
          if (!isCurrentTrack) {
            await playbackActions.goToTrack(trackIndex);
          }
          await playbackActions.seekTo(chapt.startSeconds);
          setIsCurrChapter(true);
        }}
      >
        <View className="w-[40] flex-row justify-center items-center border-r border-amber-600 bg-[#FFE194] flex-grow">
          <ToTopIcon />
        </View>
      </TouchableOpacity>
      <View className="flex-row justify-between p-2 pr-3 flex-grow">
        <Text className={`${isCurrChapter ? "font-semibold text-sm" : ""}`}>{chapt.title}</Text>
        <View className="flex-row justify-start ">
          <Text className="text-xs">{formatSeconds(chapt.startSeconds)} - </Text>
          <Text className="text-xs">{formatSeconds(chapt.endSeconds)}</Text>
        </View>
      </View>
    </View>
  );
};
