import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import React, { useEffect } from "react";
import { MotiView } from "moti";
import { useTempStore, useTracksStore } from "@store/store";
import { useSettingStore } from "@store/store-settings";
import { exists } from "react-native-fs";
import { getColorLuminance, getTextColor } from "@utils/otherUtils";

const ModalPopup = ({ isDropdownOpen, setIsDropdownOpen }) => {
  const [localOpen, setLocalOpen] = React.useState(isDropdownOpen);
  const collections = useTracksStore((state) => state.collections);
  const allPlaylists = useTracksStore((state) => state.playlists);
  const [collectionCount, setCollectionCount] = React.useState({});
  const actions = useSettingStore((state) => state.actions);
  const height = collections.length * 25.2;

  useEffect(() => {
    calculateCollectionCount();
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
          className="w-[150]  mt-[100] border border-amber-800 justify-center items-center bg-amber-50"
          // from={{ opacity: 0, translateY: -200 }}
          // animate={{ opacity: localOpen ? 1 : 0, translateY: localOpen ? 0 : -200 }}
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: localOpen ? 1 : 0.4, height: localOpen ? height : 0 }}
          // exit={{ opacity: 0, translateY: -200 }}
        >
          <ScrollView style={{ width: "100%" }}>
            {collections?.map((collection) => {
              const noBooks = !collectionCount[collection.id];
              return (
                <Pressable
                  disabled={noBooks}
                  onPress={() => handleCollectionPress(collection.id)}
                  // Mute the color a bit so that black text will work on all colors
                  style={{
                    backgroundColor: `${collection?.color}aa` || "white",
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  }}
                  key={collection.id}
                  className="px-2 py-1 h-[25]"
                >
                  <View className="flex flex-row justify-between">
                    <Text
                      className={`${noBooks ? "text-gray-700" : "font-semibold"}`}
                      // style={{color: getTextColor(getColorLuminance(collection.color).colorLuminance)}}
                    >
                      {collection.name}
                    </Text>
                    <Text>{collectionCount[collection.id] || 0}</Text>
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

export default ModalPopup;
