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
import { listGoogleFiles } from "@utils/googleUtils";
import { MimeTypes } from "@robinbobin/react-native-google-drive-api-wrapper";

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
  const [files, setFiles] = useState([]);

  const getFiles = async () => {
    const files = await listGoogleFiles();
    console.log("FILES", files);

    setFiles(files.files);
  };

  React.useEffect(() => {
    getFiles();
  }, []);

  return (
    <View>
      <Text>GDrive Testing</Text>
      {files.map((el) => {
        let classT = "font-medium text-base text-amber-800";
        if (el.mimeType === MimeTypes.FOLDER) {
          classT = "font-semibold text-lg";
        }

        return (
          <Text className={classT} key={el.id}>
            {el.name}
          </Text>
        );
      })}
    </View>
  );
};

export default playarea;
