import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTracksStore } from "../../store/store";
import {
  deleteFromFileSystem,
  readFileSystemDir,
} from "../../store/data/fileSystemAccess";
import { AudioTrack } from "../../store/types";
import { colors } from "../../constants/Colors";
import ManageTracks from "../../components/settings/ManageTracks";
import { useRouter } from "expo-router";

const getOutliers = (tracks: AudioTrack[], files) => {
  // { filename: "", orphaned: boolean}
  let filesProcessed = [];
  const tracksFileNames = tracks.map((el) => el.fileURI);
  for (const file of files) {
    filesProcessed.push({
      filename: file,
      orphaned: !tracksFileNames.includes(file),
    });
  }
  return filesProcessed;
};
const ManageTracksRoute = () => {
  const route = useRouter();
  return (
    <View>
      <TouchableOpacity
        onPress={() =>
          route.push({
            pathname: "/settings/managetracksmodal",
            params: { trackId: "x" },
          })
        }
      >
        <Text>Modal</Text>
      </TouchableOpacity>
      <ManageTracks />
    </View>
  );
};

export default ManageTracksRoute;
