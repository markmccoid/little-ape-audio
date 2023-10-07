import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTracksStore } from "../../store/store";
import { deleteFromFileSystem, readFileSystemDir } from "../../store/data/fileSystemAccess";
import { AudioTrack } from "../../store/types";
import { colors } from "../../constants/Colors";
import ManageTracks from "../../components/settings/ManageTracks";
import { useRouter } from "expo-router";
const { width, height } = Dimensions.get("window");

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
      <Image
        source={require("../../../assets/background.png")}
        style={[
          StyleSheet.absoluteFill,
          {
            width,
            height,
            opacity: 0.5,
          },
        ]}
      />
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
