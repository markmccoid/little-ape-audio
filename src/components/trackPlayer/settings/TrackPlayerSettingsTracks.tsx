import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";

import DragDropEntry, {
  DragItem,
  sortArray,
  TScrollFunctions,
} from "@markmccoid/react-native-drag-and-order";
import { Track } from "react-native-track-player";
import { usePlaybackStore } from "../../../store/store";
import TrackDragItem from "./TrackDragItem";

function buildList(queue: Track[]) {
  return queue.map((el, index) => {
    return { id: el.title, name: el.title, pos: index };
  });
}

const TrackPlayerSettingsTracks = () => {
  const queue = usePlaybackStore((state) => state.trackPlayerQueue);
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(buildList(queue));
  }, []);

  return (
    <DragDropEntry
      scrollStyles={{
        width: "100%",
        // height: "30%",
        borderWidth: 1,
        borderColor: "#aaa",
      }}
      updatePositions={(positions) => {
        console.log("POSITIONS", sortArray(positions, items, "id"));
        //     updateItemList(sortArray<ItemType>(positions, items, "pos"))
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
            // onRemoveItem={() => removeItemById(item.id)}
            // firstItem={idx === 0 ? true : false}
          />
        );
      })}
    </DragDropEntry>
  );
};

export default TrackPlayerSettingsTracks;
