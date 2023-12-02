import { View, Text, ScrollView, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useTrackActions, useTracksStore } from "../../store/store";
import { deleteFromFileSystem, readFileSystemDir } from "../../store/data/fileSystemAccess";
import { AudioTrack, Playlist, PlaylistId } from "../../store/types";
import { colors } from "../../constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Audio } from "expo-av";

type Outliers = ReturnType<typeof getOutliers>;
const getOutliers = (playlists: Record<PlaylistId, Playlist>, tracks: AudioTrack[], files) => {
  // { filename: "", orphaned: boolean}
  type FilesProcessed = {
    id: string;
    filename: string;
    orphaned: boolean;
    playlistOrphan: boolean;
    foundTrack: AudioTrack;
  };
  let filesProcessed: FilesProcessed[] = [];
  // get list of tracks in playlists
  let playlistTracks = [];

  Object.keys(playlists).forEach((key, index) => {
    playlistTracks.push(playlists[key].trackIds);
  });
  playlistTracks = playlistTracks.flatMap((el) => el);
  // console.log(playlistTracks);
  const tracksFileNames = tracks.map((el) => el.fileURI);

  for (const track of tracks) {
    // Don't include the local images in this track list
    if (track.fileURI.includes("localimages_")) continue;
    const foundTrack = tracks.find((el) => el.fileURI === track.fileURI);

    filesProcessed.push({
      id: track.id,
      filename: track.fileURI,
      orphaned: !tracksFileNames.includes(track.fileURI),
      playlistOrphan: !playlistTracks.includes(track.id),
      foundTrack,
    });
  }
  return filesProcessed;
};
const ManageTracks = () => {
  const route = useRouter();
  const tracks = useTracksStore((state) => state.tracks);
  const trackActions = useTrackActions();
  const playlists = useTracksStore((state) => state.playlists);

  const [files, setFiles] = useState(undefined);

  useEffect(() => {
    const readFiles = async () => {
      const files = await readFileSystemDir();
      const filesProcessed = getOutliers(playlists, tracks, files);
      setFiles(filesProcessed);
    };
    readFiles();
  }, [tracks]);

  const deleteAnOrphan = async (file: AudioTrack) => {
    // await deleteFromFileSystem(file.fileURI, false);
    // The removeTracks will delete from the filesystem also.
    await trackActions.removeTracks([file.id]);
    //!  NEED TO CREATE -> deleteFromTracksStore(file.id)
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
                playlistOrphan: boolean;
                foundTrack: AudioTrack;
              },
              idx: number
            ) => (
              <View
                key={idx}
                className={`flex-row flex-1 justify-between  px-1 py-2  ${
                  file.orphaned ? "bg-red-500" : file.playlistOrphan ? "bg-blue-600" : "bg-white"
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

                <TouchableOpacity
                  onPress={async () => await deleteAnOrphan(file.foundTrack)}
                  disabled={!file.orphaned && !file.playlistOrphan}
                >
                  <Text>{file.orphaned || file.playlistOrphan ? "Delete Orphan" : "Good"}</Text>
                </TouchableOpacity>
              </View>
            )
          )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageTracks;
