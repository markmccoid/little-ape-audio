import { View, Text, Alert, StyleSheet, TouchableOpacity } from "react-native";
import React, { useMemo, useState } from "react";
import { Stack, useLocalSearchParams, useSearchParams } from "expo-router";
import { useTrackActions, useTracksStore } from "@store/store";
import { Playlist } from "@store/types";
import { TextInput } from "react-native-gesture-handler";
import { AnimatedPressable } from "@components/common/buttons/Pressables";
import TPImagePicker from "@components/trackPlayer/settings/TPImagePicker";
import { getImageFromWeb } from "@utils/otherUtils";

const playlistedit = () => {
  const { playlistId } = useLocalSearchParams() as { playlistId: string };
  const trackActions = useTrackActions();
  const playlistUpdated = useTracksStore((state) => state.playlistUpdated);
  const [playlist, setPlaylist] = useState<Playlist>();

  React.useEffect(() => {
    const playlist = trackActions.getPlaylist(playlistId);
    setPlaylist(playlist);
  }, [playlistId, playlistUpdated]);

  const handleEditPlaylist = async () => {
    Alert.prompt(
      "Edit Playlist Name",
      "Enter a new Playlist Name",
      [
        {
          text: "OK",
          onPress: (text) => trackActions.updatePlaylistFields(playlist.id, { name: text }),
        },

        { text: "Cancel", onPress: () => {} },
      ],
      "plain-text",
      playlist.name
    );
  };

  const handleGetImageFromWeb = async (searchString) => {
    const imageResults = await getImageFromWeb(searchString);
    await trackActions.updatePlaylistFields(playlistId, imageResults);
  };
  if (!playlist) return null;
  return (
    <View className="flex-1 flex-col mt-2">
      <Stack.Screen
        options={{
          title: `Edit Playlist`,
        }}
      />
      <View className="flex-row w-full mr-4 p-2 mb-2 justify-between ">
        <Text className="text-base font-medium flex-1 mr-2" numberOfLines={1} lineBreakMode="tail">
          {playlist?.name}
        </Text>

        <View className="items-center justify-end flex-row ">
          <AnimatedPressable onPress={handleEditPlaylist} buttonStyle="default">
            <Text>Change Name</Text>
          </AnimatedPressable>
        </View>
      </View>
      <View className="w-full bg-black" style={{ height: StyleSheet.hairlineWidth }} />
      <View className="mt-3 px-2">
        <TPImagePicker currPlaylistId={playlist.id} />
      </View>
      <View className="items-center justify-end flex-row ">
        <AnimatedPressable
          onPress={() => handleGetImageFromWeb(playlist.name)}
          buttonStyle="default"
        >
          <Text>Find New Image</Text>
        </AnimatedPressable>
      </View>
    </View>
  );
};

export default playlistedit;
