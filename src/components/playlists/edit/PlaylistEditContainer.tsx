import { View, Text, Alert, StyleSheet, Switch } from "react-native";
import React, { useState } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { usePlaybackStore, useTrackActions, useTracksStore } from "@store/store";
import { Playlist } from "@store/types";
import { getImageFromWeb } from "@utils/otherUtils";
import { AnimatedPressable } from "@components/common/buttons/Pressables";
import TPImagePicker from "@components/trackPlayer/settings/TPImagePicker";
import PlaylistDetails from "../PlaylistDetails";
import TrackPlayerSettingsTracks from "@components/trackPlayer/settings/TrackPlayerSettingsTracks";
import PlaylistEditTracks from "./PlaylistEditTracks";

const PlaylistEditContainer = () => {
  const { playlistId } = useLocalSearchParams() as { playlistId: string };
  const trackActions = useTrackActions();
  const playlistUpdated = useTracksStore((state) => state.playlistUpdated);
  const [playlist, setPlaylist] = useState<Playlist>();
  const didUpdate = usePlaybackStore().didUpdate;

  React.useEffect(() => {
    const playlist = trackActions.getPlaylist(playlistId);
    setPlaylist(playlist);
  }, [playlistId, playlistUpdated, didUpdate]);

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

  //~~ get image from web function
  const handleGetImageFromWeb = async (searchString) => {
    const imageResults = await getImageFromWeb(searchString);
    if (imageResults) {
      await trackActions.updatePlaylistFields(playlistId, imageResults);
    }
  };
  //~~

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
      <View className="items-center justify-end flex-row w-full ">
        <View className="flex-row justify-start item-center ml-2 flex-1">
          <Text className="mr-2 mt-1">Override Track Images?</Text>
          <Switch
            style={{ marginRight: 20, transform: [{ scaleY: 0.7 }, { scaleX: 0.7 }] }}
            trackColor={{ false: "#767577", true: "#4caf50" }}
            thumbColor={playlist?.overrideTrackImage ? "#8bc34a" : "#ddd"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={async () =>
              await trackActions.updatePlaylistFields(playlistId, {
                overrideTrackImage: !playlist.overrideTrackImage,
              })
            }
            value={playlist?.overrideTrackImage}
          />
        </View>
        <AnimatedPressable
          onPress={() => handleGetImageFromWeb(playlist?.name)}
          buttonStyle="default"
        >
          <Text>Find New Image</Text>
        </AnimatedPressable>
      </View>
      {/* <PlaylistDetails playlistId={playlist.id} /> */}
      <View className="mx-2">
        <PlaylistEditTracks playlistId={playlist.id} />
      </View>
    </View>
  );
};

export default PlaylistEditContainer;
