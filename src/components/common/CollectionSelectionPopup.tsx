import { View, Text, Modal, Dimensions, ScrollView, Pressable, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { MotiView } from "moti";
import { useTempStore, useTracksStore } from "@store/store";
import { useSettingStore } from "@store/store-settings";
import { exists } from "react-native-fs";
import { getColorLuminance, getTextColor } from "@utils/otherUtils";
import { CollectionItem } from "@store/types";
import { colors } from "@constants/Colors";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");
const POPUP_WIDTH = width * 0.6;
const allCollectionItem: CollectionItem = {
  id: "all",
  name: "All Audio",
  headerTitle: "All Audio",
  color: "white",
  type: "protected",
};

const CollectionSelectionPopup = ({ isDropdownOpen, setIsDropdownOpen }) => {
  const [localOpen, setLocalOpen] = React.useState(isDropdownOpen);
  const collections = useTracksStore((state) => state.collections);
  const allPlaylists = useTracksStore((state) => state.playlists);
  const [collectionCount, setCollectionCount] = React.useState({});
  const [shownCollections, setShownCollections] = React.useState([]);
  const [popupHeight, setPopupHeight] = React.useState(0);
  const actions = useSettingStore((state) => state.actions);

  //~ - - - - - -
  //~ We only show the collections that have at least one playlist associated
  //~ We use the number of collections to shown to calculate the height of the popup
  //~ - - - - - -
  useEffect(() => {
    const updCollectionCount = calculateCollectionCount();
    const updShowCollections = collections?.filter((el) => updCollectionCount[el.id] > 0);
    // manually add in the "all" collection so it will show as an option
    // NOTE: handleCollectionPress() in the component must do special processing
    //       to handle the "all" collection.
    setShownCollections([allCollectionItem, ...updShowCollections]);
    setPopupHeight([allCollectionItem, ...updShowCollections].length * 45.2);
    setLocalOpen(isDropdownOpen);
  }, [isDropdownOpen, allPlaylists, collections]);

  //~ - - - - - -
  //~ Create a map of the number of books in each collection
  //~ so that we can display the number of books in each collection
  const calculateCollectionCount = () => {
    let collectionIdCount = {};
    for (const playlist of Object.values(allPlaylists)) {
      collectionIdCount[playlist.collection?.id] =
        (collectionIdCount?.[playlist.collection?.id] || 0) + 1;
    }
    collectionIdCount["all"] = Object.keys(allPlaylists).length;
    setCollectionCount(collectionIdCount);
    return collectionCount;
  };

  //~ - - - - - -
  //~ Set the selected collection
  const handleCollectionPress = (collectionId: string) => {
    if (collectionId === "all") {
      actions.setSelectedCollection(allCollectionItem);
    } else {
      actions.setSelectedCollection(collections.find((el) => el.id === collectionId));
    }
    exitModal();
  };
  //~ - - - - - -
  //~ Exiting Modal, set localOpen first, then wait to set main dropdown state so we see exit animation
  const exitModal = () => {
    setLocalOpen(false);
    setTimeout(() => setIsDropdownOpen(false), 150);
  };

  return (
    <Modal visible={isDropdownOpen} transparent animationType="none">
      <Pressable className="flex-1 justify-start items-center" onPress={exitModal}>
        <MotiView
          className="rounded-lg mt-[85] border border-amber-800 justify-center items-center bg-amber-50 overflow-hidden"
          style={{ width: POPUP_WIDTH }}
          // from={{ opacity: 0, translateY: -200 }}
          // animate={{ opacity: localOpen ? 1 : 0, translateY: localOpen ? 0 : -200 }}
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: localOpen ? 1 : 0.4, height: localOpen ? popupHeight : 0 }}
          // exit={{ opacity: 0, translateY: -200 }}
        >
          <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false}>
            <>
              {shownCollections?.map((collection, index) => {
                const isLastItem = index === shownCollections.length - 1;
                const isFirstItem = index === 0;
                return (
                  <LinearGradient
                    key={collection.id}
                    colors={[colors.amber50, collection?.color, collection?.color]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                  >
                    <Pressable
                      onPress={() => handleCollectionPress(collection.id)}
                      // Mute the color a bit so that black text will work on all colors
                      style={{
                        // backgroundColor: colors.amber100,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderTopWidth: isFirstItem ? StyleSheet.hairlineWidth : 0,
                      }}
                      key={collection.id}
                      className={`h-[45] w-full `}
                    >
                      {/* <View
                      className="h-full w-10 absolute right-0"
                      style={{
                        backgroundColor: collection?.color,
                      }}
                    /> */}
                      <View className="flex flex-row h-full justify-start items-center">
                        <View className="px-4 flex-grow">
                          <Text
                            className={`font-semibold text-lg`}
                            style={{
                              textShadowColor: "white",
                              textShadowOffset: { width: 3, height: 0 },
                              textShadowRadius: 10,
                            }}
                            // style={{color: getTextColor(getColorLuminance(collection.color).colorLuminance)}}
                          >
                            {collection.name}
                          </Text>
                        </View>
                        <View
                          className={`flex flex-row justify-center items-center ml-4 bg-amber-100 h-full`}
                          style={{
                            width: 20,
                            // height: 20,
                            // borderRadius: 20,
                            borderLeftWidth: StyleSheet.hairlineWidth,
                          }}
                        >
                          <Text className={` text-sm `}>{collectionCount[collection.id] || 0}</Text>
                        </View>
                      </View>
                    </Pressable>
                  </LinearGradient>
                );
              })}
            </>
          </ScrollView>
        </MotiView>
      </Pressable>
    </Modal>
  );
};

export default CollectionSelectionPopup;
