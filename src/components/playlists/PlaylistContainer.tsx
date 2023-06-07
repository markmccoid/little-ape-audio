import { View, Text, Image, TouchableOpacity, Button } from "react-native";
import React, { useEffect, useRef } from "react";
import {
  usePlaybackStore,
  usePlaylists,
  useTrackActions,
  useTracksStore,
} from "../../store/store";
import { Link, useNavigation } from "expo-router";
import PlaylistRow from "./PlaylistRow";
import { ScrollView } from "react-native-gesture-handler";

const PlaylistContainer = () => {
  const playlists = usePlaylists(); //useTracksStore((state) => state.playlists);
  const currentPlaylistId = usePlaybackStore(
    (state) => state.currentPlaylistId
  );
  const scrollRef = useRef(null);
  const rowHeightRef = useRef(null);

  // const tracks = useTracksStore((state) => state.tracks);
  // const trackActions = useTrackActions();
  // const navigation = useNavigation();

  // Scroll to the active track
  const scrollToRow = (rowIndex) => {
    scrollRef.current.scrollTo({
      x: 0,
      y: rowIndex * 200 - 1, // Assuming each row has a height of 55 and 1 border
      animated: true,
    });
  };

  useEffect(() => {
    scrollToRow(0);
  }, [currentPlaylistId]);
  return (
    <ScrollView
      ref={scrollRef}
      className="w-full flex-grow"
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      {playlists.map((playlist) => (
        <PlaylistRow key={playlist.id} playlist={playlist} />
      ))}

      {/* <Text>TRACKS</Text>
      <View>
        {tracks.map((track, idx) => (
          <View key={idx}>
            <Text>{track.id}</Text>
            <Image
              style={{
                width: 100,
                height: 100,
                resizeMode: "stretch",
                borderRadius: 10,
              }}
              source={{ uri: track.metadata?.pictureURI }}
            />
          </View>
        ))}
      </View> */}
    </ScrollView>
  );
};

export default PlaylistContainer;
