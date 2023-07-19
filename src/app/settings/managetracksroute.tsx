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
