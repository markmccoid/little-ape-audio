import {
  View,
  FlatList,
  Text,
  Dimensions,
  NativeScrollEvent,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePlaybackStore, usePlaylists, useTrackActions, useTracksStore } from "../../store/store";
import { Link, useFocusEffect, useNavigation, useRouter } from "expo-router";
import PlaylistRow from "./PlaylistRow";
import { ScrollView, Swipeable } from "react-native-gesture-handler";
import { AnimatePresence, MotiImage, MotiText, MotiView, useAnimationState } from "moti";
import PlaylistActionBar from "./PlaylistActionBar";
import { colors } from "@constants/Colors";
import AddBook from "@components/common/svg/AddBook";
import CollectionSelectionPopup from "@components/common/CollectionSelectionPopup";
import { useSettingStore } from "@store/store-settings";
import { ChevronDownIcon } from "@components/common/svg/Icons";
import useDownloadQStore from "@store/store-downloadq";
import AnimatedDLText from "@components/common/animations/AnimatedDLText";
const { width, height: screenHeight } = Dimensions.get("window");

const PlaylistContainer = () => {
  const route = useRouter();
  //! downloadq
  const isDownloading = useDownloadQStore((state) => state.isDownloading);
  const queueCount = useDownloadQStore((state) => state.queue.length);

  // const activeTaskPlaylistIds = useDownloadQStore((state) => [
  //   ...new Set(state.activeTasks.map((task) => task.playlistId)),
  // ]);
  const activeTasks = useDownloadQStore((state) => state.activeTasks);
  // console.log("activeTasks", activeTasks);
  const reduced = activeTasks
    ? activeTasks.reduce(
        (final, curr) => {
          if (curr.processStatus === "downloading") {
            final.downloading = (final?.downloading || 0) + 1;
          } else {
            final.adding = (final?.adding || 0) + 1;
          }
          return final;
        },
        { downloading: 0, adding: 0 }
      )
    : {};

  // const [activeDownload, setActiveDownload] = useState(false);
  //!

  const [isSelectingRow, setIsSelectingRow] = useState(false);
  const [onShow, setOnShow] = useState(false);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const playlists = usePlaylists(); //useTracksStore((state) => state.playlists);
  const { getPlaylist } = useTrackActions();
  const currentPlaylistId = usePlaybackStore((state) => state.currentPlaylistId);
  const prevPlaylistId = useRef(undefined);
  const scrollRef = useRef<FlatList>(null);
  const setCurrPlaylist = usePlaybackStore((state) => state.actions.setCurrentPlaylist);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const selectedCollection = useSettingStore((state) => state.selectedCollection);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <TouchableOpacity
          onPress={() => {
            // This will open the ModalPopup.tsx
            setIsDropdownOpen(true);
          }}
        >
          <View className="flex flex-row items-center">
            <Text className="text-base font-semibold text-amber-950">
              {selectedCollection.name}
            </Text>
            <ChevronDownIcon
              color={colors.amber950}
              size={20}
              style={{ marginTop: 2, marginLeft: 5 }}
            />
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedCollection]);

  // Scroll to the active track
  const scrollToRow = () => {
    if (playlists.length === 0) return;
    scrollRef.current?.scrollToOffset({
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
    if (isSelectingRow) return;
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

  //~ Playlist select
  const handleRowSelect = async (playlistId: string) => {
    setIsSelectingRow(true);
    const playlist = getPlaylist(playlistId);

    // Check to make sure playlist has at least one track
    if (!playlist?.trackIds || playlist?.trackIds.length === 0) {
      alert("Playlist Still Loading");
      setTimeout(() => setIsSelectingRow(false), 100);
      return;
    }
    route.push({ pathname: "/audio/player", params: { playlistId } });
    await setCurrPlaylist(playlistId);
    setIsSelectingRow(false);
    // setTimeout(() => setUpdate(false), 500);
  };

  //~ --------------------------
  //~ Swipeable auto close code
  //~ --------------------------
  let prevOpenedRow: Swipeable = undefined;
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
  //~ --------------------------
  //~ END Swipeable auto close code
  //~ --------------------------

  const renderItem = ({ item, index }) => {
    return (
      <MotiView
        from={{ opacity: 0 }}
        key={`${item.id}-${index}-${isSelectingRow}`}
        animate={{ opacity: 1 }}
        transition={{
          type: "timing",
          duration: 300,
          delay: 25 * index,
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

  // If no playlist exist, show starter screen
  if (playlists.length === 0) {
    return (
      <>
        <CollectionSelectionPopup
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
        />

        <Link
          href="/audio/dropbox/"
          asChild
          className="flex items-center justify-center flex-1 mb-[200]"
        >
          <Pressable className="p-[10] mr-[-10]">
            <AddBook size={50} headphoneColor={colors.amber800} plusBGColor={colors.amber700} />
            <View className="w-[80%] items-center">
              <Text className="text-lg font-semibold">Press the headphones to add a book</Text>
              <Text className="">
                The headphones icon in the upper right will also take you to the "Add A Book" Screen
              </Text>
            </View>
          </Pressable>
        </Link>
      </>
    );
  }

  // Show playlists
  return (
    <View className="w-full flex-1">
      {/* This is the header dropbown for the Collections menu */}
      <CollectionSelectionPopup
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
      />
      {onShow && (
        <MotiView
          className="border border-red-900 h-[40]"
          from={{ opacity: 0, height: 40 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 300,
            opacity: { type: "timing", duration: 300 },
          }}
        >
          <PlaylistActionBar closeActionBar={() => setOnShow(false)} barHeight={40} />
        </MotiView>
      )}

      {isDownloading && (
        <View className="z-10 flex-col justify-center items-center pb-1 bg-white h-[100]">
          <View>
            {/* First Line (left) */}
            <View className="flex-row justify-center items-center">
              <Text className="text-base">{`Files Left in Process Queue`}</Text>
              <Text className="text-base text-amber-950 ml-2 font-bold">{queueCount}</Text>
            </View>
            {/* Second Line (download/adding) */}
            <View className="flex-row justify-center items-center">
              <View className="flex-row justify-center items-center">
                <Text className="text-base">{`Downloading`}</Text>
                <Text className="text-base text-red-800 ml-2 font-bold">{reduced.downloading}</Text>
              </View>
              <View className="mr-2 ml-2">
                <Text>-</Text>
              </View>
              <View className="flex-row justify-center items-center">
                <Text className="text-base">{`Adding To Playlist`}</Text>
                <Text className="text-base text-green-800 ml-2 font-bold">{reduced.adding}</Text>
              </View>
            </View>
          </View>
          <AnimatedDLText />
        </View>
      )}
      <AnimatePresence>
        {!isSelectingRow && (
          <MotiView
            key={2}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            exitTransition={{ type: "timing", duration: 400 }}
            className="flex-1"
          >
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
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 10,
    backgroundColor: colors.amber100,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5.62,
  },
});
export default PlaylistContainer;
