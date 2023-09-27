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
  StyleSheet,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { usePlaybackStore, usePlaylists, useTrackActions, useTracksStore } from "../../store/store";
import { Link, useFocusEffect, useNavigation, useRouter } from "expo-router";
import PlaylistRow from "./PlaylistRow";
import { ScrollView, Swipeable } from "react-native-gesture-handler";
import { AnimatePresence, MotiView } from "moti";
import PlaylistActionBar from "./PlaylistActionBar";
import { colors } from "@constants/Colors";
import { router } from "expo-router";
const { width, height: screenHeight } = Dimensions.get("window");

const PlaylistContainer = () => {
  const route = useRouter();
  const [update, setUpdate] = useState(false);
  const [onShow, setOnShow] = useState(false);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const playlists = usePlaylists(); //useTracksStore((state) => state.playlists);
  const currentPlaylistId = usePlaybackStore((state) => state.currentPlaylistId);
  const prevPlaylistId = useRef(undefined);
  const scrollRef = useRef<FlatList>(null);
  const setCurrPlaylist = usePlaybackStore((state) => state.actions.setCurrentPlaylist);

  // Scroll to the active track
  const scrollToRow = () => {
    scrollRef.current.scrollToOffset({
      offset: 0,
      animated: true,
    });
  };

  // When route becomes focused close all playlist rows
  useFocusEffect(() => {
    closeAllRows();
  });

  useEffect(() => {
    prevPlaylistId.current = currentPlaylistId;
    scrollToRow();
  }, [currentPlaylistId]);

  // Based on the scroll position, this will show the
  // Top menu items
  const handleShowInput = (nativeEvent: NativeScrollEvent) => {
    const scrollY = nativeEvent.contentOffset.y;
    let contentHeight = nativeEvent.contentSize.height;
    // console.log("Native", contentHeight, screenHeight, scrollY);
    // console.log("CALCS", contentHeight - scrollY, layoutHeight);
    if (scrollY < -10) {
      setOnShow(true);
      return;
    }
    // If we don't have a full screen of content in the flatlist, then
    // contentHeight the check will always fail.  So we check if content < layout height
    // if so, just make them the same number.
    if (contentHeight < layoutHeight) contentHeight = layoutHeight;
    if (contentHeight - scrollY < layoutHeight - 20) {
      setOnShow(false);
    }
  };

  const handleRowSelect = async (playlistId) => {
    setUpdate(true);
    await setCurrPlaylist(playlistId);
    route.push({ pathname: "/audio/player", params: {} });
    setUpdate(false);
  };

  // Swipeable auto close code
  let prevOpenedRow = undefined;
  let renderRowRefs: Swipeable[] = [];

  const closeRow = (index) => {
    if (prevOpenedRow && prevOpenedRow !== renderRowRefs[index]) {
      prevOpenedRow.close();
    }
    prevOpenedRow = renderRowRefs[index];
  };
  const closeAllRows = () => {
    renderRowRefs.forEach((rowRef) => {
      rowRef.close();
    });
  };
  // END Swipeable auto close code

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
        style={{
          flex: 1,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.amber900,
          borderRightWidth: 0,
          backgroundColor: colors.amber200,
        }}
      >
        <PlaylistRow
          key={item.id}
          playlist={item}
          onPlaylistSelect={handleRowSelect}
          index={index}
          renderRowRefs={renderRowRefs}
          closeRow={closeRow}
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
            <PlaylistActionBar closeActionBar={() => setOnShow(false)} barHeight={40} />
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
