import {
  View,
  Text,
  // FlatList,
  Dimensions,
  TouchableOpacity,
  SectionList,
  Pressable,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import Animated, {
  interpolate,
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import SwipeableItem, { useSwipeableItemParams } from "react-native-swipeable-item";
import { colors } from "@constants/Colors";
import { usePlaybackStore, usePlaylists } from "@store/store";
import { useProgress } from "react-native-track-player";
import { useDropboxStore } from "@store/store-dropbox";

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

//!! How to determine current chapter without looking at each chapter
//!!
//!!
//!!
//!!
//!!
const playarea = () => {
  const queue = usePlaybackStore((state) => state.trackPlayerQueue);
  const currentTrack = usePlaybackStore((state) => state.currentTrack);
  const playbackActions = usePlaybackStore((state) => state.actions);
  const { position } = useProgress();
  const [sectionList, setSectionList] = useState<SectionListData[]>([]);
  const [chapters, setChapters] = useState<SectionChapter[]>();

  const folderNav = useDropboxStore((state) => state.folderNavigation);

  const [currChapterIndex, setCurrChapterIndex] = useState();
  // console.log("CURRCHAPT", currChapterIndex);
  React.useEffect(() => {
    // console.log("1", chapters);
    if (chapters?.length > 0) {
      for (let i = 0; i < chapters.length; i++) {
        if (position <= chapters[i].end) {
          setCurrChapterIndex(i);
          break;
        }
      }
    }
  }, [chapters, position]);
  React.useEffect(() => {
    if (queue) {
      const finalSectionList = queue.map((track, index) => {
        const section = track.title;
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
          data: chapters || [],
        } as SectionListData;
        return sectionList;
      });
      setSectionList(finalSectionList);
      setChapters(finalSectionList.flatMap((el) => el.data));
    }
  }, []);

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
          className={`p-2 ${
            section.position === 0 ? "border" : "border-b"
          } border-amber-500 h-[55] ${isCurrentTrack ? "bg-amber-200" : "bg-white"}`}
        >
          <Text className="text-lg">{section?.title}</Text>

          <Text className="text-lg">{section.duration}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item, index }) => {
    // console.log("SUBSECT", item);
    const isCurrChapter = index === currChapterIndex;
    return (
      <View
        className={`p-2 ${index === 0 ? "border" : "border-b"} border-amber-500 h-[55] ${
          isCurrChapter ? "bg-amber-200" : "bg-white"
        }`}
      >
        {/* <Text className="text-base">{props.item.title}</Text> */}
        <Text className="text-base">{item.title}</Text>
      </View>
    );
  };

  return (
    <View>
      <Text>{JSON.stringify(folderNav)}</Text>
    </View>
  );
};

export default playarea;
