import {
  View,
  Text,
  // FlatList,
  Dimensions,
  TouchableOpacity,
  SectionList,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import React, { useCallback, useEffect, useReducer, useRef, useState } from "react";
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
import { FilesAndFolders, listGoogleDriveFiles, listGoogleFiles } from "@utils/googleUtils";
import { MimeTypes } from "@robinbobin/react-native-google-drive-api-wrapper";
import LAABColorPicker from "@components/common/LAABColorPicker";
import {
  laabMetaAggrRecurse,
  laabMetaAggrRecurseBegin,
  useDropboxStore,
} from "@store/store-dropbox";
import { AnimatedPressable } from "@components/common/buttons/Pressables";
import PlayAreaTemp from "@components/settings/PlayAreaTemp";

//!! How to determine current chapter without looking at each chapter
//!!
//!!
//!!
//!!
//!!
const playarea = () => {
  return (
    <View>
      <PlayAreaTemp />
    </View>
  );
};

export default playarea;
