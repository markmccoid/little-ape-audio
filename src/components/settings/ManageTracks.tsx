import { View, Text, ScrollView, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useTracksStore } from "../../store/store";
import { deleteFromFileSystem, readFileSystemDir } from "../../store/data/fileSystemAccess";
import { AudioTrack } from "../../store/types";
import { colors } from "../../constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router";

const getOutliers = (tracks: AudioTrack[], files) => {
  // { filename: "", orphaned: boolean}
  let filesProcessed = [];

  const tracksFileNames = tracks.map((el) => el.fileURI);
  for (const file of files) {
    // Don't include the local images in this track list
    if (file.includes("localimages_")) continue;
    const foundTrack = tracks.find((el) => el.fileURI === file);

    filesProcessed.push({
      filename: file,
      orphaned: !tracksFileNames.includes(file),
      foundTrack,
    });
  }
  return { filesProcessed };
};
const ManageTracks = () => {
  const route = useRouter();
  const tracks = useTracksStore((state) => state.tracks);
  const [files, setFiles] = useState(undefined);

  useEffect(() => {
    const readFiles = async () => {
      const files = await readFileSystemDir();
      const { filesProcessed } = getOutliers(tracks, files);
      setFiles(filesProcessed);
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
        // contentContainerStyle={{ flexGrow: 1, marginBottom: 150 }}
        style={{
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.amber900,
          marginBottom: 150,
        }}
      >
        {files &&
          files?.map(
            (
              file: {
                filename: string;
                orphaned: boolean;
                foundTrack: AudioTrack;
              },
              idx: number
            ) => (
              <View
                key={idx}
                className={`flex-row flex-1 justify-between  px-1 py-2  ${
                  file.orphaned ? "bg-red-500" : "bg-white"
                }`}
                style={{
                  borderBottomColor: colors.amber800,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    route.push({
                      pathname: "/settings/managetracksmodal",
                      params: { trackId: file.filename },
                    })
                  }
                  className="flex-1"
                >
                  <Text
                    className={`flex-1${file.orphaned ? "text-white" : ""}`}
                    numberOfLines={2}
                    lineBreakMode="tail"
                  >
                    {file.filename}
                  </Text>
                </TouchableOpacity>
                {/* <Text className={`flex-1 font-semibold`}>
                  {file.foundTrack &&
                    file.foundTrack?.metadata?.chapters &&
                    file.foundTrack?.metadata?.chapters.map(
                      (el) => el?.description
                    )}
                </Text> */}
                <TouchableOpacity
                  onPress={async () => await deleteAnOrphan(file.filename)}
                  disabled={!file.orphaned}
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
