import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Button,
  Pressable,
  FlatList,
  Dimensions,
  NativeScrollEvent,
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
import { AnimatePresence, MotiView } from "moti";
import PlaylistActionBar from "./PlaylistActionBar";

const { width, height: screenHeight } = Dimensions.get("window");

const PlaylistContainer = () => {
  const route = useRouter();
  const [update, setUpdate] = useState(false);
  const [onShow, setOnShow] = useState(false);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const playlists = usePlaylists(); //useTracksStore((state) => state.playlists);
  const currentPlaylistId = usePlaybackStore(
    (state) => state.currentPlaylistId
  );
  const prevPlaylistId = useRef(undefined);
  const scrollRef = useRef<FlatList>(null);
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

  // Based on the scroll position, this will show the
  // Top menu items
  const handleShowInput = (nativeEvent: NativeScrollEvent) => {
    const scrollY = nativeEvent.contentOffset.y;
    const contentHeight = nativeEvent.contentSize.height;
    // console.log("Native", contentHeight, screenHeight, scrollY);
    // console.log("CALCS", contentHeight - scrollY, layoutHeight);

    if (scrollY < -5) {
      setOnShow(true);
    }
    if (contentHeight - scrollY < layoutHeight - 30) {
      setOnShow(false);
    }
  };

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
    <View className="w-full flex-1">
      <AnimatePresence>
        {onShow && (
          <MotiView
            className="border border-red-900 h-[40]"
            from={{ opacity: 0, height: 40 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              type: "timing",
              duration: 300,
              opacity: { type: "timing", duration: 300 },
            }}
            exitTransition={{
              type: "timing",
              duration: 500,
              opacity: { type: "timing", duration: 200 },
            }}
          >
            <PlaylistActionBar
              closeActionBar={() => setOnShow(false)}
              barHeight={40}
            />
          </MotiView>
        )}
      </AnimatePresence>
      <View className="flex-1">
        <FlatList
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: 30 }}
          data={playlists}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onScroll={(e) => handleShowInput(e.nativeEvent)}
          onLayout={(e) => {
            // Store in state and then use in conjunction with other info
            // to hide bar when at end of list
            // contentHeight - scrollYOffset >= layoutHeight
            // console.log("onLayout", e.nativeEvent.layout.height);
            setLayoutHeight(e.nativeEvent.layout.height);
          }}
        />
      </View>
    </View>
  );
};

export default PlaylistContainer;
