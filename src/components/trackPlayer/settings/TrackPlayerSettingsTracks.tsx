import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";

import { usePlaybackStore, useTrackActions } from "../../../store/store";
import { ApeTrack } from "../../../store/types";
import { colors } from "../../../constants/Colors";
import DraggableFlatList, {
  OpacityDecorator,
} from "react-native-draggable-flatlist";
import {
  DeleteIcon,
  DragHandleIcon,
  EditIcon,
} from "@components/common/svg/Icons";
import { RectButton, Swipeable } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import TrackPlayerSettingsTracksRow from "./TrackPlayerSettingsTracksRow";

function buildList(queue: ApeTrack[]) {
  return queue.map((el, index) => {
    return {
      id: el.filename,
      name: el.title,
      trackNum: el.trackNum,
      pos: index,
    };
  });
}

export type BuildList = ReturnType<typeof buildList>;

const TrackPlayerSettingsTracks = () => {
  const queue = usePlaybackStore((state) => state.trackPlayerQueue);
  const playlistId = usePlaybackStore((state) => state.currentPlaylistId);

  const actions = usePlaybackStore((state) => state.actions);
  const trackActions = useTrackActions();
  const [items, setItems] = useState<BuildList>([]);
  const [tracksMetaSorted, setTracksMetaSorted] = useState([]);

  useEffect(() => {
    setItems(buildList(queue));
    // Get the playlist tracks so that we can pull their metadata.trackNum
    // field and sort by that field.
    const tracks = trackActions.getPlaylistTracks(playlistId);
    const sortedTracks = tracks.map((track) => ({
      trackId: track.id,
      trackNum: track.metadata.trackNum,
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
        borderBottomColor: "black",
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginLeft: 2,
      }}
    >
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

      <View className="border border-amber-800 mb-[30]">
        <DraggableFlatList
          data={items}
          containerStyle={{ backgroundColor: colors.amber400 }}
          renderPlaceholder={() => (
            <View className="bg-amber-300 w-full h-full">
              <Text></Text>
            </View>
          )}
          onDragEnd={({ data }) => onDragEnd(data)}
          // onDragEnd={({ data }) => actions.updateFavFolderArray(data)}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </View>

      {/* <DragDropEntry
        scrollStyles={{
          width: "100%",
          borderLeftWidth: StyleSheet.hairlineWidth,
          backgroundColor: colors.amber100,
          // height: "30%",
          // borderWidth: 1,
          // borderColor: "#aaa",
        }}
        updatePositions={async (positions) => {
          // console.log("POSITIONS", sortArray(positions, items, "id"));
          const sortedItems = sortArray(positions, items, "id");
          // console.log(sortedItems.map((el) => el.id));
          await actions.updatePlaylistTracks(
            playlistId,
            sortedItems.map((el) => el.id)
          );
        }}
        // getScrollFunctions={(functionObj) => setScrollFunctions(functionObj)}
        itemHeight={50}
        handlePosition="left"
        // handle={AltHandle} // This is optional.  leave out if you want the default handle
        enableDragIndicator={true}
      >
        {items.map((item, idx) => {
          console.log("ITEM", item.id, item.name);
          return (
            <TrackDragItem
              key={item.id}
              name={item.name}
              id={item.id}
              trackNum={item.trackNum}
              itemHeight={50}
              onEditItem={(val) => console.log("edit", val)}
              // onRemoveItem={() => removeItemById(item.id)}
              // firstItem={idx === 0 ? true : false}
            />
          );
        })}
      </DragDropEntry> */}
    </View>
  );
};

export default TrackPlayerSettingsTracks;
