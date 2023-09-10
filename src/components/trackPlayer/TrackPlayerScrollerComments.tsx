import { View, Text, ScrollView, Dimensions } from "react-native";
import React from "react";
import {
  useCurrentPlaylist,
  usePlaybackStore,
  useTrackActions,
} from "@store/store";

const { width, height } = Dimensions.get("window");
const COMPONENT_WIDTH = width - 80;

const TrackPlayerScrollerComments = () => {
  const actions = useTrackActions();
  const playbackTrack = usePlaybackStore((state) => state.currentTrack);
  const [trackComment, setTrackComment] = React.useState("");

  // Track comment
  React.useEffect(() => {
    const track = actions.getTrack(playbackTrack.id);
    const trackComment = track.metadata.comment;
    setTrackComment(trackComment);
  }, [playbackTrack]);

  return (
    <ScrollView
      style={{
        width: COMPONENT_WIDTH,
        height: COMPONENT_WIDTH,
        // padding: 10,
        marginVertical: 10,
      }}
      className=" border border-amber-700 bg-amber-100"
    >
      <View className="p-2 ">
        <Text className="font-medium">{trackComment}</Text>
      </View>
    </ScrollView>
  );
};

export default TrackPlayerScrollerComments;
