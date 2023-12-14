import { View, Text, TouchableOpacity, StyleSheet, Pressable, Alert } from "react-native";
import React, { useEffect, useRef, useState } from "react";

import { usePlaybackStore, useTrackActions } from "../../../store/store";
import { ApeTrack, AudioTrack } from "@store/types";
import DraggableFlatList, { OpacityDecorator } from "react-native-draggable-flatlist";

import { RectButton, Swipeable } from "react-native-gesture-handler";
import TrackPlayerSettingsTracksRow from "../../trackPlayer/settings/TrackPlayerSettingsTracksRow";
import usePlaylistColors from "hooks/usePlaylistColors";
import { useRouter } from "expo-router";

function buildList(trackList: AudioTrack[]) {
  if (!trackList) return [];
  return trackList.map((el, index) => {
    return {
      id: el.filename,
      name: el.metadata?.title,
      trackNum: el.metadata?.trackNum || "",
      pos: index,
    };
  });
}

export type BuildList = ReturnType<typeof buildList>;

const PlaylistEditTracks = ({ playlistId }: { playlistId: string }) => {
  const playlistColors = usePlaylistColors();
  const trackActions = useTrackActions();
  const [items, setItems] = useState<BuildList>([]);
  const [tracksMetaSorted, setTracksMetaSorted] = useState([]);
  const playlistTracks = trackActions.getPlaylistTracks(playlistId);
  const playlistLoaded = usePlaybackStore((state) => state.playlistLoaded);
  const router = useRouter();

  useEffect(() => {
    setItems(buildList(playlistTracks));
    // Get the playlist tracks so that we can pull their metadata.trackNum
    // field and sort by that field.
    // const tracks = trackActions.getPlaylistTracks(playlistId);
    const sortedTracks = playlistTracks.map((track) => ({
      trackId: track.id,
      trackNum: parseInt(track?.metadata?.trackNum) || 0,
    }));
    sortedTracks.sort((a, b) => a.trackNum - b.trackNum);

    setTracksMetaSorted(sortedTracks);
  }, [playlistTracks.length]);

  let prevOpenedRow = undefined;
  let renderRowRefs: Swipeable[] = [];

  const closeRow = (index) => {
    if (prevOpenedRow && prevOpenedRow !== renderRowRefs[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = renderRowRefs[index];
  };

  type Unpacked<T> = T extends (infer U)[] ? U : T;

  const renderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: {
    item: Unpacked<BuildList>;
    drag: any;
    isActive: boolean;
    getIndex: () => number;
  }) => {
    const index = getIndex();
    return (
      <TouchableOpacity onLongPress={() => alertMoveTrack(playlistId, item.id)}>
        <TrackPlayerSettingsTracksRow
          item={item}
          drag={drag}
          isActive={isActive}
          index={index}
          renderRowRefs={renderRowRefs}
          closeRow={closeRow}
          currPlaylistId={playlistId}
        />
      </TouchableOpacity>
    );
  };

  const onDragEnd = async (data) => {
    // await actions.updatePlaylistTracks(
    //   playlistId,
    //   data.map((el) => el.id)
    // );
    await trackActions.updatePlaylistTracks(
      playlistId,
      data.map((el) => el.id)
    );
    const playlistTracks = trackActions.getPlaylistTracks(playlistId);
    setItems(buildList(playlistTracks));
  };

  const alertMoveTrack = (playlistId: string, trackId: string) =>
    Alert.alert("Move or Copy a Track", "", [
      {
        text: "Move/Copy to New Playlist",
        onPress: () =>
          router.push({
            pathname: "/audio/trackmove",
            params: {
              moveType: "new",
              fromPlaylistId: playlistId,
              trackId,
            },
          }),
      },
      {
        text: "Move/Copy to Existing Playlist",
        onPress: () =>
          router.push({
            pathname: "/audio/trackmove",
            params: {
              moveType: "existing",
              fromPlaylistId: playlistId,
              trackId,
            },
          }),
      },
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
    ]);

  return (
    <View
      className="w-full flex-1 "
      style={{
        borderBottomColor: "black",
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginLeft: 2,
      }}
    >
      <View className="flex-row justify-end mb-2 w-full ">
        <TouchableOpacity
          className="border border-amber-900 bg-amber-500 p-1 rounded-md"
          onPress={async () => {
            // await actions.updatePlaylistTracks(
            //   playlistId,
            //   tracksMetaSorted.map((el) => el.trackId)
            // );
            await trackActions.updatePlaylistTracks(
              playlistId,
              tracksMetaSorted.map((el) => el.id)
            );
          }}
        >
          <Text>Sort by Metdata</Text>
        </TouchableOpacity>
      </View>

      <View className="border border-amber-800">
        <DraggableFlatList
          data={items}
          containerStyle={{ backgroundColor: playlistColors?.bg || "white" }}
          renderPlaceholder={() => (
            <View
              className="w-full h-full"
              style={{ backgroundColor: playlistColors?.bg || "white" }}
            ></View>
          )}
          onDragEnd={({ data }) => onDragEnd(data)}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </View>
    </View>
  );
};

export default PlaylistEditTracks;
