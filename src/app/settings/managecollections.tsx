import { View, Text, Alert } from "react-native";
import React from "react";
import LAABColorPicker from "@components/common/LAABColorPicker";
import { Stack, useLocalSearchParams } from "expo-router";
import PlaylistCollectionSetup from "@components/playlists/edit/ManageCollectionsContainer";
import { useTrackActions } from "@store/store";
import { TouchableOpacity } from "react-native-gesture-handler";
import { AddToListIcon } from "@components/common/svg/Icons";

const managecollections = () => {
  const trackActions = useTrackActions();
  const handleAddNewCollection = async () => {
    Alert.prompt(
      "Add Collection",
      "Enter a new Collection Name",
      [
        {
          text: "OK",
          onPress: (text) =>
            trackActions.addOrUpdateCollection({
              id: text.toLowerCase(),
              name: text,
              headerTitle: text,
              color: "#00bb00",
              type: "audiobook",
            }),
        },

        { text: "Cancel", onPress: () => {} },
      ],
      "plain-text"
    );
  };
  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          headerRight: () => {
            return (
              <View>
                <TouchableOpacity onPress={handleAddNewCollection}>
                  {/* <Text>New</Text> */}
                  <AddToListIcon />
                </TouchableOpacity>
              </View>
            );
          },
        }}
      />
      <PlaylistCollectionSetup />
      {/* <LAABColorPicker /> */}
    </View>
  );
};

export default managecollections;
