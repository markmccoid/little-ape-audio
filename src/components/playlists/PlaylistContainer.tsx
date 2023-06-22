import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Button,
  Pressable,
  FlatList,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  usePlaybackStore,
  usePlaylists,
  useTrackActions,
  useTracksStore,
} from "../../store/store";
import { Link, useNavigation, useRouter } from "expo-router";
import PlaylistRow from "./PlaylistRow";
import { ScrollView } from "react-native-gesture-handler";
import { MotiView } from "moti";

const PlaylistContainer = () => {
  const route = useRouter();
  const [update, setUpdate] = useState(false);
  const playlists = usePlaylists(); //useTracksStore((state) => state.playlists);
  const currentPlaylistId = usePlaybackStore(
    (state) => state.currentPlaylistId
  );
  const prevPlaylistId = useRef(undefined);
  const scrollRef = useRef(null);
  const setCurrPlaylist = usePlaybackStore(
    (state) => state.actions.setCurrentPlaylist
  );

  // Scroll to the active track
  const scrollToRow = () => {
    scrollRef.current.scrollToOffset({
      offset: 0,
      animated: true,
    });
  };

  useEffect(() => {
    prevPlaylistId.current = currentPlaylistId;
    scrollToRow();
  }, [currentPlaylistId]);

  const handleRowSelect = async (playlistId) => {
    setUpdate(true);
    await setCurrPlaylist(playlistId);
    route.push({ pathname: "/audio/player", params: {} });
    setUpdate(false);
  };
  const renderItem = ({ item, index }) => {
    return (
      <MotiView
        from={{ opacity: 0 }}
        key={`${item.id}-${index}-${update}`}
        animate={{ opacity: 1 }}
        transition={{
          type: "timing",
          duration: 800,
          delay: 100 * index,
        }}
        style={{ flex: 1 }}
      >
        <PlaylistRow
          key={item.id}
          playlist={item}
          onPlaylistSelect={handleRowSelect}
        />
      </MotiView>
    );
  };
  return (
    <View className="w-full flex-grow flex-1">
      <FlatList
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: 30 }}
        data={playlists}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
      />
    </View>
    // <ScrollView
    //   ref={scrollRef}
    //   className="w-full flex-grow"
    //   contentContainerStyle={{ paddingBottom: 30 }}
    // >
    //   {playlists.map((playlist, index) => (
    //     <PlaylistRow key={playlist.id} playlist={playlist} />
    //   ))}

    //   {/* <Text>TRACKS</Text>
    //   <View>
    //     {tracks.map((track, idx) => (
    //       <View key={idx}>
    //         <Text>{track.id}</Text>
    //         <Image
    //           style={{
    //             width: 100,
    //             height: 100,
    //             resizeMode: "stretch",
    //             borderRadius: 10,
    //           }}
    //           source={{ uri: track.metadata?.pictureURI }}
    //         />
    //       </View>
    //     ))}
    //   </View> */}
    // </ScrollView>
  );
};

export default PlaylistContainer;
