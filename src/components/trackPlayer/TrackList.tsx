import { View, Text, ScrollView, SectionList, TouchableOpacity, Dimensions } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { usePlaybackStore, useTrackActions } from "../../store/store";
import { formatSeconds } from "../../utils/formatUtils";
import TrackPlayer, { useProgress } from "react-native-track-player";
import { colors } from "../../constants/Colors";
import sectionListGetItemLayout from "react-native-section-list-get-item-layout";

const { width, height } = Dimensions.get("window");
type SectionChapter = {
  title: string;
  start: number;
  end: number;
};
type SectionListData = {
  title: string;
  filename: string;
  queuePos: number;
  duration: number;
  data: SectionChapter[];
};

const TrackList = () => {
  const queue = usePlaybackStore((state) => state.trackPlayerQueue);
  const currentTrack = usePlaybackStore((state) => state.currentTrack);
  const currentPlaylistId = usePlaybackStore((state) => state.currentPlaylistId);
  const isPlaylistLoaded = usePlaybackStore((state) => state.playlistLoaded);
  const currentTrackIndex = usePlaybackStore((state) => state.currentTrackIndex);
  const playbackActions = usePlaybackStore((state) => state.actions);
  const trackActions = useTrackActions();
  const { position, duration } = useProgress();
  const [sectionList, setSectionList] = useState<SectionListData[]>([]);
  const [chapters, setChapters] = useState<SectionChapter[]>();
  const [currChapterIndex, setCurrChapterIndex] = useState(undefined);

  const scrollViewRef = useRef<SectionList>(null);

  // Scroll to the active track
  const scrollToRow = (sectionIndex: number, chapterIndex: number) => {
    if (!scrollViewRef.current.scrollToLocation) return;
    scrollViewRef.current.scrollToLocation({
      sectionIndex: sectionIndex,
      itemIndex: chapterIndex,
      animated: true,
    });
  };

  // Scroll to the current track and/or chapter
  useEffect(() => {
    if (scrollViewRef.current && currChapterIndex !== undefined) {
      scrollToRow(currentTrackIndex, currChapterIndex + 1);

      // else {
      //   console.log("scroll", currentTrackIndex, currChapterIndex);
      //   scrollToRow(currentTrackIndex, 1);
      //   scrollViewRef.current.scrollToLocation({ sectionIndex: 5, itemIndex: 0, viewPosition: 0 });
      // }
    }
  }, [currentTrackIndex, scrollViewRef.current, currChapterIndex]);

  // set the currChapterIndex based on the progress position
  useEffect(() => {
    if (chapters?.length > 0) {
      for (let i = 0; i < chapters.length; i++) {
        if (position <= chapters[i].end) {
          setCurrChapterIndex(i);
          break;
        }
      }
    } else {
      setCurrChapterIndex(0);
    }
  }, [chapters, position]);
  useEffect(() => {
    if (queue) {
      const finalSectionList = queue.map((track, index) => {
        const chapters = track?.chapters?.map((chapt) => {
          return {
            title: chapt.title,
            start: chapt.startSeconds,
            end: chapt.endSeconds,
          };
        }) as SectionChapter[];
        const sectionList = {
          title: track.title,
          filename: track.filename,
          queuePos: index,
          id: track.id,
          duration: track.duration,
          data: chapters || [{ title: "~NO CHAPTERS~" }],
        } as SectionListData;
        return sectionList;
      });
      setSectionList(finalSectionList);
      setChapters(finalSectionList.flatMap((el) => el.data));
    }
  }, []);

  //~~ ========================================================
  //~~ Section RENDERERS
  const getItemLayout = sectionListGetItemLayout({
    getItemHeight: (rowData, sectionIndex, rowIndex) => 45,
  });

  //~ RENDER HEADER
  const renderSectionHeader = ({ section }) => {
    // console.log("SECTION", section);
    const isCurrentTrack = section.id === currentTrack.id;
    return (
      <TouchableOpacity
        key={section.id}
        onPress={() => {
          if (!isCurrentTrack) {
            playbackActions.goToTrack(section?.queuePos);
          }
        }}
        className=""
      >
        <View
          className={`p-2 border items-center flex-row ${
            section.position === 0 ? "border" : "border-b"
          } border-amber-500 h-[45] ${isCurrentTrack ? "bg-amber-200" : "bg-white"}`}
        >
          <View className="flex-row items-center justify-between ">
            <Text
              className="text-sm font-semibold flex-1 flex-grow"
              numberOfLines={2}
              ellipsizeMode="tail"
              // style={{ width: width / 1.2 }}
            >{`${(section.queuePos + 1).toString().padStart(2, "0")} - ${section.title}`}</Text>
            <View style={{ width: 75 }} className="flex-row justify-end">
              <Text className="text-xs">
                {isCurrentTrack
                  ? formatSeconds(section.duration - position)
                  : formatSeconds(section.duration)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  //~ RENDER ITEM
  const renderItem = ({ item, index, section }) => {
    // console.log("SUBSECT", item);
    if (item.title === "~NO CHAPTERS~") {
      return <View></View>;
    }
    const isCurrChapter = index === currChapterIndex;
    const isCurrentTrack = currentTrackIndex === section?.queuePos;
    return (
      <View
        className={`flex-row items-center justify-between ml-4 ${
          index === 0 ? "border" : "border-b border-l"
        } border-amber-500 h-[45] ${isCurrChapter ? "bg-amber-300" : "bg-white"}`}
      >
        <TouchableOpacity
          onPress={async () => {
            if (!isCurrentTrack) {
              await playbackActions.goToTrack(section.queuePos);
            }
            await playbackActions.seekTo(item?.start);
            // setIsCurrChapter(true);
          }}
        >
          <View className="w-[40] flex-row justify-center items-center border-r border-amber-600 bg-[#FFE194] flex-grow">
            {/* <ToTopIcon /> */}
            <Text className="text-base font-bold">{index + 1}</Text>
          </View>
        </TouchableOpacity>
        <View className={`flex-row  p-2  items-center justify-between flex-grow`}>
          {/* <Text className="text-base">{props.item.title}</Text> */}
          <Text className="text-sm">{item.title}</Text>
          <Text className="text-xs">{`${formatSeconds(item.start)} - ${formatSeconds(
            item.end
          )}`}</Text>
        </View>
      </View>
    );
  };
  //~~ ========================================================
  if (!isPlaylistLoaded) {
    return null;
  }

  return (
    <View className="flex-1" style={{ borderWidth: 1, borderColor: colors.amber500 }}>
      <SectionList
        ref={scrollViewRef}
        sections={sectionList}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        style={{ flex: 1, marginBottom: 40, paddingBottom: 10 }}
        contentContainerStyle={{ paddingBottom: 2 }}
        getItemLayout={getItemLayout}
      />
    </View>
  );
};

export default TrackList;

const ChapterRow = ({
  isCurrentTrack,
  playbackActions,
  chapt,
  trackIndex,
  chapterIndex,
  progress,
}) => {
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
          {/* <ToTopIcon /> */}
          <Text className="text-base font-bold">{chapterIndex + 1}</Text>
        </View>
      </TouchableOpacity>
      <View className="flex-row justify-between p-2 pr-3 flex-grow">
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className={`${isCurrChapter ? "font-semibold text-sm" : ""} flex-1`}
        >
          {chapt.title}
        </Text>
        <View className="flex-row justify-start ">
          <Text className="text-xs">{formatSeconds(chapt.startSeconds)} - </Text>
          <Text className="text-xs">{formatSeconds(chapt.endSeconds)}</Text>
        </View>
      </View>
    </View>
  );
};
