import { View, Text, TouchableOpacity, StyleSheet, Pressable, Alert } from "react-native";
import React, { useEffect, useRef, useState } from "react";

import { usePlaybackStore, useTrackActions } from "../../../store/store";
import { ApeTrack } from "../../../store/types";
import { colors } from "../../../constants/Colors";
import DraggableFlatList, { OpacityDecorator } from "react-native-draggable-flatlist";

import { RectButton, Swipeable } from "react-native-gesture-handler";
import TrackPlayerSettingsTracksRow from "./TrackPlayerSettingsTracksRow";
import usePlaylistColors from "hooks/usePlaylistColors";
import { useRouter } from "expo-router";

function buildList(queue: ApeTrack[]) {
  if (!queue) return [];
  return queue.map((el, index) => {
    return {
      id: el.filename,
      name: el.title,
      trackNum: el?.trackNum,
      pos: index,
    };
  });
}

export type BuildList = ReturnType<typeof buildList>;

const TrackPlayerSettingsTracks = () => {
  const queue = usePlaybackStore((state) => state.trackPlayerQueue);
  const playlistId = usePlaybackStore((state) => state.currentPlaylistId);
  const playlistColors = usePlaylistColors();
  const actions = usePlaybackStore((state) => state.actions);
  const trackActions = useTrackActions();
  const [items, setItems] = useState<BuildList>([]);
  const [tracksMetaSorted, setTracksMetaSorted] = useState([]);
  const router = useRouter();

  useEffect(() => {
    setItems(buildList(queue));
    // Get the playlist tracks so that we can pull their metadata.trackNum
    // field and sort by that field.
    const tracks = trackActions.getPlaylistTracks(playlistId);
    const sortedTracks = tracks.map((track) => ({
      trackId: track.id,
      trackNum: parseInt(track?.metadata?.trackNum) || 0,
    }));
    sortedTracks.sort((a, b) => a.trackNum - b.trackNum);

    setTracksMetaSorted(sortedTracks);
  }, [queue]);

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
      <TrackPlayerSettingsTracksRow
        currPlaylistId={playlistId}
        item={item}
        drag={drag}
        isActive={isActive}
        index={index}
        renderRowRefs={renderRowRefs}
        closeRow={closeRow}
      />
    );
  };

  const onDragEnd = async (data) => {
    await actions.updatePlaylistTracks(
      playlistId,
      data.map((el) => el.id)
    );
  };

  return (
    <View
      className="w-full mb-10 "
      style={{
        // borderBottomColor: "black",
        // borderBottomWidth: StyleSheet.hairlineWidth,
        marginLeft: 2,
      }}
    >
      {items.length > 1 && (
        <View className="flex-row justify-end mb-2 w-full ">
          <TouchableOpacity
            className="border border-amber-900 bg-amber-500 p-1 rounded-md"
            onPress={async () => {
              await actions.updatePlaylistTracks(
                playlistId,
                tracksMetaSorted.map((el) => el.trackId)
              );
            }}
          >
            <Text>Sort by Metdata</Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="border border-amber-800 mb-[30]">
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
          // onDragEnd={({ data }) => actions.updateFavFolderArray(data)}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </View>
    </View>
  );
};

export default TrackPlayerSettingsTracks;
