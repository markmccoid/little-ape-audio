import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { getCurrentPlaylist, usePlaybackStore, useTracksStore } from "@store/store";
import { colors } from "@constants/Colors";
import { PlaylistImageColors } from "@store/types";
import { getImageColors } from "@utils/otherUtils";

type Props = {
  setHeight: (height: number) => void;
};
const TPImagePicker = ({ currPlaylistId }) => {
  // const currPlaylistId = usePlaybackStore((state) => state.currentPlaylistId);
  const trackActions = useTracksStore((state) => state.actions);
  const playlistUpdated = useTracksStore((state) => state.playlistUpdated);
  const pl = getCurrentPlaylist();

  // THis is just used when a new pic is made the default on playlist
  // it forces playlistImage memo to update
  const [picUpdate, setPicUpdate] = useState(false);
  const [tracks, setTracks] = useState<
    {
      id: string;
      pictureURI: string;
      pictureAspectRatio: number;
      pictureColors: PlaylistImageColors;
    }[]
  >([]);
  const playlistImage = useMemo(() => {
    const plImage = trackActions.getPlaylist(currPlaylistId);
    return {
      id: "0",
      pictureURI: plImage?.imageURI,
      pictureAspectRatio: plImage?.imageAspectRatio,
    };
  }, [currPlaylistId, picUpdate, playlistUpdated]);

  useEffect(() => {
    const buildImageList = async () => {
      const tracks = trackActions.getPlaylistTracks(currPlaylistId);
      let prevTrack = "";
      let images = [];
      for (const track of tracks) {
        if (prevTrack !== track.metadata.pictureURI) {
          let pictureColors = undefined;

          const picToRead = track.metadata.pictureURI || playlistImage.pictureURI;
          pictureColors = (await getImageColors(picToRead)) as PlaylistImageColors;

          images.push({
            id: track.id,
            pictureURI: track.metadata.pictureURI,
            pictureAspectRatio: track.metadata.pictureAspectRatio,
            pictureColors: pictureColors,
          });
        }
        prevTrack = track.metadata.pictureURI;
      }
      setTracks(images);
      //   return images as {
      //     id: string;
      //     pictureURI: string;
      //     pictureAspectRatio: number;
      //     pictureColors: IOSImageColors;
      //   }[];
    };
    buildImageList();
  }, []);

  // const tracks = useMemo(async () => {
  //   const tracks = trackActions.getPlaylistTracks(currPlaylistId);
  //   let prevTrack = "";
  //   let images = [];
  //   for (const track of tracks) {
  //     if (prevTrack !== track.metadata.pictureURI) {
  //       let pictureColors = undefined;
  //       if (!track.metadata.pictureColors) {
  //         pictureColors = (await getColors(track.metadata.pictureURI, {
  //           quality: "highest",
  //         })) as IOSImageColors;
  //       }
  //       images.push({
  //         id: track.id,
  //         pictureURI: track.metadata.pictureURI,
  //         pictureAspectRatio: track.metadata.pictureAspectRatio,
  //         pictureColors: track.metadata.pictureColors || pictureColors,
  //       });
  //     }
  //     prevTrack = track.metadata.pictureURI;
  //   }

  //   return images as {
  //     id: string;
  //     pictureURI: string;
  //     pictureAspectRatio: number;
  //     pictureColors: IOSImageColors;
  //   }[];
  // }, [currPlaylistId]);

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
        height: 130,
        backgroundColor: "white", //colors.amber400,
        marginBottom: 8,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.amber900,
        borderRadius: 10,
      }}
      contentContainerStyle={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        padding: 8,
      }}
      horizontal
      // onLayout={(event) => {
      //   console.log(event.nativeEvent.layout.height);
      //   setHeight(event.nativeEvent.layout.height);
      // }}
    >
      <View className="m-1 border-2 border-red-600">
        <Image source={{ uri: playlistImage.pictureURI }} style={{ width: 100, height: 100 }} />
      </View>
      {tracks.map((track) => {
        if (track?.pictureURI) {
          return (
            <TouchableOpacity
              key={track.id}
              className="p-2"
              onPress={async () => {
                await trackActions.updatePlaylistFields(currPlaylistId, {
                  imageURI: track?.pictureURI,
                  imageAspectRatio: track?.pictureAspectRatio,
                  imageColors: track?.pictureColors,
                });
                setPicUpdate((prev) => !prev);
              }}
            >
              <Image source={{ uri: track.pictureURI }} style={{ width: 100, height: 100 }} />
            </TouchableOpacity>
          );
        }
        return null;
      })}
    </ScrollView>
  );
};

export default TPImagePicker;
