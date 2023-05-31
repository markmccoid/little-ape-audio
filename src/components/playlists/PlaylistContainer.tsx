import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import {
  usePlaylists,
  useTrackActions,
  useTracksStore,
} from "../../store/store";
import { Link, useNavigation } from "expo-router";
import PlaylistRow from "./PlaylistRow";
import { ScrollView } from "react-native-gesture-handler";

const PlaylistContainer = () => {
  const playlists = usePlaylists(); //useTracksStore((state) => state.playlists);
  const tracks = useTracksStore((state) => state.tracks);
  const trackActions = useTrackActions();
  const navigation = useNavigation();

  return (
    <ScrollView
      className="w-full"
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <View className="mt-2">
        {playlists.map((playlist) => (
          <PlaylistRow key={playlist.id} playlist={playlist} />
        ))}
      </View>
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
