import {
  Dimensions,
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
} from "react-native";
import React, { useMemo } from "react";
import { AudioFile, Media } from "@store/data/absTypes";
import { downloadFileBlob, getCleanFileName } from "@store/data/fileSystemAccess";
import ABSFile from "./ABSFile";
import ABSActionBar from "./ABSActionBar";
import { absTagFiles } from "@store/data/absTagFile";
// import { absTagFiles } from "@store/store-abs";
import { AnimateHeight } from "@components/common/animations/AnimateHeight";
import { colors } from "@constants/Colors";
import { MotiView } from "moti";
import { EmptyMDHeartIcon, MDHeartIcon, PowerIcon } from "@components/common/svg/Icons";
import { createFolderMetadataKey, useDropboxStore } from "@store/store-dropbox";
import { Skeleton } from "moti/skeleton";

const { width, height } = Dimensions.get("window");
const ABSBookLoadingIndicator = () => {
  // console.log("BOOKID", media.libraryItemId);
  return (
    <View>
      <MotiView
        animate={{ backgroundColor: "#ffffff" }}
        transition={{
          type: "timing",
        }}
        className="flex-1"
      >
        <Skeleton colorMode="light" height={25} width={width - 20} />
        <View className="h-2" />
        <View className="ml-2 flex-row">
          <Skeleton colorMode="light" height={150} width={150} />
          <View className="flex-col ml-2 my-2 justify-between h-[130]">
            <Skeleton colorMode="light" height={25} width={width - 150 - 20} />
            {/* <View className="h-2" /> */}
            <Skeleton colorMode="light" height={25} width={width - 150 - 20} />
            {/* <View className="h-2" /> */}
            <Skeleton colorMode="light" height={25} width={width - 150 - 20} />
          </View>
        </View>
      </MotiView>
    </View>
  );
};

export default ABSBookLoadingIndicator;
