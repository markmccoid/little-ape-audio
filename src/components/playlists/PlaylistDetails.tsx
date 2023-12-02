import { View, Text } from "react-native";
import React from "react";
import { useTrackActions } from "@store/store";

const PlaylistDetails = ({ playlistId }: { playlistId: string }) => {
  const actions = useTrackActions();
  const playlistInfo = actions.getPlaylist(playlistId);

  return (
    <View>
      <Text>PlaylistDetails</Text>
      <Text>{playlistInfo.trackIds.toString()}</Text>
    </View>
  );
};

export default PlaylistDetails;
