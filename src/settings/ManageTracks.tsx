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
const ManageTracks = () => {
  const tracks = useTracksStore((state) => state.tracks);
  const [files, setFiles] = useState(undefined);

  useEffect(() => {
    const readFiles = async () => {
      const files = await readFileSystemDir();
      const outliers = getOutliers(tracks, files);
      setFiles(outliers);
    };
    readFiles();
  }, []);

  const deleteAnOrphan = async (filename) => {
    await deleteFromFileSystem(filename, false);
    setFiles((prev) => prev.filter((el) => el.filename !== filename));
  };
  return (
    <SafeAreaView className="flex ">
      <View className="mx-3 mt-3 mb-1">
        <Text className="text-base font-semibold">Remove Orphaned Tracks</Text>
      </View>
      <ScrollView
        // ref={scrollRef}
        className="mx-2  rounded-lg bg-white"
        style={{
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.amber900,
        }}
      >
        {files &&
          files?.map(
            (file: { filename: string; orphaned: boolean }, idx: number) => (
              <View
                key={idx}
                className={`flex-row justify-between  px-1 py-2 ${
                  file.orphaned ? "bg-red-500" : "bg-white"
                }`}
                style={{
                  borderBottomColor: colors.amber800,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                }}
              >
                <Text className={`flex-1 ${file.orphaned ? "text-white" : ""}`}>
                  {file.filename}
                </Text>
                <TouchableOpacity
                  onPress={async () => await deleteAnOrphan(file.filename)}
                >
                  <Text>{file.orphaned ? "Delete Orphan" : "Good"}</Text>
                </TouchableOpacity>
              </View>
            )
          )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageTracks;
