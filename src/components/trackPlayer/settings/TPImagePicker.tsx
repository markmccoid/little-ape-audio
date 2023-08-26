import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import React, { useMemo, useState } from "react";
import { usePlaybackStore, useTracksStore } from "@store/store";
import { getImageSize } from "@utils/audioUtils";
import { colors } from "@constants/Colors";

type Props = {
  setHeight: (height: number) => void;
};
const TPImagePicker = () => {
  const currPlaylistId = usePlaybackStore((state) => state.currentPlaylistId);
  const trackActions = useTracksStore((state) => state.actions);
  // THis is just used when a new pic is made the default on playlist
  // it forces playlistImage memo to update
  const [picUpdate, setPicUpdate] = useState(false);

  const playlistImage = useMemo(() => {
    const plImage = trackActions.getPlaylist(currPlaylistId);
    return {
      id: "0",
      pictureURI: plImage.imageURI,
      pictureAspectRatio: plImage.imageAspectRatio,
    };
  }, [currPlaylistId, picUpdate]);

  const tracks = useMemo(() => {
    const tracks = trackActions.getPlaylistTracks(currPlaylistId);
    let prevTrack = "";
    let images = [];
    for (const track of tracks) {
      if (prevTrack !== track.metadata.pictureURI) {
        images.push({
          id: track.id,
          pictureURI: track.metadata.pictureURI,
          pictureAspectRatio: track.metadata.pictureAspectRatio,
        });
      }
      prevTrack = track.metadata.pictureURI;
    }

    return images as {
      id: string;
      pictureURI: string;
      pictureAspectRatio: number;
    }[];
  }, [currPlaylistId]);

  // console.log("CurrPlaylist", currPlaylistId, tracks.length);

  return (
    // <View
    //   className="border bg-green-400 flex-row flex-wrap justify-center "
    //   style={{ height: 250 }}
    //   onLayout={(event) => {
    //     //! DON"T NEED TO CALC HEIGHT BUT DOCUMENT THIS
    //     //! Need to add ascrollview instead.
    //     //! Need to add the playlist Image
    //     //! Need to dedup images if possilbe
    //     //! Need to let user select an image
    //     setHeight(event.nativeEvent.layout.height);
    //   }}
    // >

    <ScrollView
      style={{
        // flex: 1,
        height: 250,
        backgroundColor: colors.amber400,
        marginHorizontal: 8,
        marginBottom: 10,
      }}
      contentContainerStyle={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
      // onLayout={(event) => {
      //   console.log(event.nativeEvent.layout.height);
      //   setHeight(event.nativeEvent.layout.height);
      // }}
    >
      <View className="m-1 border-2 border-red-600">
        <Image
          source={{ uri: playlistImage.pictureURI }}
          style={{ width: 100, height: 100 }}
        />
      </View>
      {tracks.map((track) => {
        if (track.pictureURI) {
          return (
            <TouchableOpacity
              key={track.id}
              className="p-2"
              onPress={async () => {
                await trackActions.updatePlaylistFields(currPlaylistId, {
                  imageURI: track.pictureURI,
                  imageAspectRatio: track.pictureAspectRatio,
                });
                setPicUpdate((prev) => !prev);
              }}
            >
              <Image
                source={{ uri: track.pictureURI }}
                style={{ width: 100, height: 100 }}
              />
            </TouchableOpacity>
          );
        }
        return null;
      })}
    </ScrollView>
  );
};

export default TPImagePicker;
