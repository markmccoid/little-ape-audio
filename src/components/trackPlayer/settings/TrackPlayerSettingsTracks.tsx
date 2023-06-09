import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";

import DragDropEntry, {
  DragItem,
  sortArray,
  TScrollFunctions,
} from "@markmccoid/react-native-drag-and-order";
import { usePlaybackStore, useTrackActions } from "../../../store/store";
import TrackDragItem from "./TrackDragItem";
import { ApeTrack } from "../../../store/types";

function buildList(queue: ApeTrack[]) {
  return queue.map((el, index) => {
    return { id: el.filename, name: el.title, pos: index };
  });
}

const TrackPlayerSettingsTracks = () => {
  const queue = usePlaybackStore((state) => state.trackPlayerQueue);
  const playlistId = usePlaybackStore((state) => state.currentPlaylistId);

  const actions = usePlaybackStore((state) => state.actions);
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(buildList(queue));
  }, [queue]);

  return (
    <DragDropEntry
      scrollStyles={{
        width: "100%",
        // height: "30%",
        borderWidth: 1,
        borderColor: "#aaa",
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
        return (
          <TrackDragItem
            key={item.id}
            name={item.name}
            id={item.id}
            itemHeight={50}
            onEditItem={(val) => console.log("edit", val)}
            // onRemoveItem={() => removeItemById(item.id)}
            // firstItem={idx === 0 ? true : false}
          />
        );
      })}
    </DragDropEntry>
  );
};

export default TrackPlayerSettingsTracks;
