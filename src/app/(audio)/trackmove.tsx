import { View, Text, Image, StyleSheet, Button } from "react-native";
import React, { useReducer, useState } from "react";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { usePlaybackStore, useTrackActions, useTracksStore } from "@store/store";
import { TextInput } from "react-native-gesture-handler";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import uuid from "react-native-uuid";
import MoveToNew from "@components/playlists/edit/MoveToNew";
import MoveToExisting from "@components/playlists/edit/MoveToExisting";
import { create } from "lodash";
import TrackPlayer from "react-native-track-player";

const trackmove = () => {
  const { moveType, createNewPlaylist, fromPlaylistId, trackId } = useLocalSearchParams();
  // console.log(createNewPlaylist, fromPlaylistId, trackId);
  const [newPLName, setNewPLName] = useState("New Playlist Name");
  const [isMoving, toggleIsMoving] = useReducer((state) => !state, true);
  const [selectedId, setSelectedId] = useState("");
  const trackActions = useTrackActions();
  const playbackActions = usePlaybackStore((state) => state.actions);

  /*
  NEW
  1. Show Playlist Name input -> default to "New Playlist"
  2. Save Button pressed then
  - remove track from "fromPlaylistId"
  - Create new playlist with new name
  - Add track to new playlist
  - close modal route with alert that new playlist has been created

  MOVE
  1. Show list of existing playlists
  2. When one is selected then
  - remove track from "fromPlaylistId"
  - Add track to chosen playlist
  - close modal route with alert that track has been moved
   
  */

  //~~ ------------------------------------------
  //~~ Move or Copy a track from one playlist to another
  //~~ If the 'selectedId' is undefined, then we create a new playlist
  //~~ as a target for the track
  //~~ ------------------------------------------
  const moveTrackToPlaylist = async (
    fromPlaylistId: string,
    trackId: string,
    playlistName?: string,
    //if undefined, then we create a new playlist as a target for the track
    selectedId?: string
  ) => {
    const newPlaylistId = selectedId ? selectedId : uuid.v4().toString();
    if (!selectedId) {
      trackActions.addNewPlaylist(playlistName, "", newPlaylistId);
    }

    await trackActions.addTracksToPlaylist(newPlaylistId, [trackId]);
    // set shouldRemoveFile=false so we don't delete from device
    if (isMoving) {
      const playlistExists = await trackActions.deleteTrackFromPlaylist(
        fromPlaylistId,
        trackId,
        false
      );
      if (!playlistExists) {
        router.back();
      }
    }
    await playbackActions.resetPlaybackStore();
    // TrackPlayer.reset();
    router.back();
    // If playlist deleted go back to main screen
  };

  return (
    <View>
      <Stack.Screen
        options={{
          title: "Move/Copy Track",
          headerLeft: () => {
            return (
              <TouchableOpacity onPress={router.back}>
                <Text>Cancel</Text>
              </TouchableOpacity>
            );
          },
          headerRight: () => {
            return (
              <TouchableOpacity
                onPress={async () => {
                  if (moveType === "new") {
                    await moveTrackToPlaylist(fromPlaylistId, trackId, newPLName);
                  } else {
                    await moveTrackToPlaylist(fromPlaylistId, trackId, "", selectedId);
                  }
                }}
              >
                <Text>Save</Text>
              </TouchableOpacity>
            );
          },
        }}
      />

      {moveType === "new" ? (
        <MoveToNew
          newPLName={newPLName}
          setNewPLName={setNewPLName}
          isMoving={isMoving}
          toggleIsMoving={toggleIsMoving}
          trackId={trackId}
        />
      ) : (
        <MoveToExisting
          trackId={trackId}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          isMoving={isMoving}
          toggleIsMoving={toggleIsMoving}
        />
      )}
      {/* <View className="m-2 flex-row items-center">
        <Text className="font-semibold mr-2">Playlist Name</Text>
        <TextInput
          className="border p-2 w-[50%] rounded-lg bg-white"
          value={newPLName}
          onChangeText={(val) => setNewPLName(val)}
        />
      </View>
      <Button title={isMoving ? "Move" : "Copy"} onPress={toggleIsMoving} />
      <Text className="mt-2 mx-2 font-semibold">Track Being {isMoving ? "Moved" : "Copied"}</Text>
      <View className="flex-row border rounded-lg mx-2 my-1">
        <Image
          source={{ uri: trackInfo.metadata?.pictureURI }}
          className="w-[50] h-[50]"
          style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: "black" }}
        />
        <View className="flex-col justify-center flex-1 my-1 bg-white">
          <Text numberOfLines={1} ellipsizeMode="tail" className="mx-2 flex-1">
            {trackInfo.metadata?.title}
          </Text>
          <Text className="mx-2">{trackInfo.metadata?.artist}</Text>
        </View>
      </View> */}
    </View>
  );
};

export default trackmove;
