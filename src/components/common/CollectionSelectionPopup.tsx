import { View, Text, Modal, ScrollView, Pressable, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { MotiView } from "moti";
import { useTempStore, useTracksStore } from "@store/store";
import { useSettingStore } from "@store/store-settings";
import { exists } from "react-native-fs";
import { getColorLuminance, getTextColor } from "@utils/otherUtils";

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
    setShownCollections(updShowCollections);
    setPopupHeight(updShowCollections.length * 35.2);
    setLocalOpen(isDropdownOpen);
  }, [isDropdownOpen]);

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
    actions.setSelectedCollection(collections.find((el) => el.id === collectionId));
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
          className="rounded-lg mt-[85] border border-amber-800 justify-center items-center bg-amber-50"
          // from={{ opacity: 0, translateY: -200 }}
          // animate={{ opacity: localOpen ? 1 : 0, translateY: localOpen ? 0 : -200 }}
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: localOpen ? 1 : 0.4, height: localOpen ? popupHeight : 0 }}
          // exit={{ opacity: 0, translateY: -200 }}
        >
          <ScrollView style={{ width: "100%" }}>
            {shownCollections?.map((collection, index) => {
              const isLastItem = index === shownCollections.length - 1;
              const isFirstItem = index === 0;
              return (
                <Pressable
                  onPress={() => handleCollectionPress(collection.id)}
                  // Mute the color a bit so that black text will work on all colors
                  style={{
                    backgroundColor: `${collection?.color}aa` || "white",
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  }}
                  key={collection.id}
                  className={`h-[35] ${isLastItem ? "rounded-br-lg rounded-bl-lg" : ""}
                  ${isFirstItem ? "rounded-tr-lg round-tl-lg" : ""}`}
                >
                  <View className="flex flex-row justify-start items-center">
                    <View className="px-2 py-1 flex-grow">
                      <Text
                        className={`font-semibold text-lg`}
                        // style={{color: getTextColor(getColorLuminance(collection.color).colorLuminance)}}
                      >
                        {collection.name}
                      </Text>
                    </View>
                    <View
                      className={`flex flex-row justify-center items-center ml-4 bg-amber-100 h-full 
                      ${isLastItem ? "rounded-br-lg" : ""} ${isFirstItem ? "rounded-tr-lg" : ""}`}
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
              );
            })}
          </ScrollView>
        </MotiView>
      </Pressable>
    </Modal>
  );
};

export default CollectionSelectionPopup;
