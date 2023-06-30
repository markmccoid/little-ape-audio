import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTracksStore } from "../../src/store/store";
import {
  deleteFromFileSystem,
  readFileSystemDir,
} from "../../src/store/data/fileSystemAccess";
import { AudioTrack } from "../../src/store/types";
import { colors } from "../../src/constants/Colors";
import ManageTracks from "../../src/settings/ManageTracks";

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
  return <ManageTracks />;
};

export default ManageTracksRoute;
