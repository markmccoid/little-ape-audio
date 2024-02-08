import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import React from "react";
import { useTrackActions, useTracksStore } from "@store/store";
import { getColorLuminance, getTextColor } from "@utils/otherUtils";
import { MotiView } from "moti";
import { Entypo } from "@expo/vector-icons";
import Animated, {
  BounceIn,
  BounceOut,
  FadeIn,
  FadeOut,
  LightSpeedInLeft,
  LightSpeedInRight,
  LightSpeedOutRight,
  StretchInY,
  StretchOutY,
} from "react-native-reanimated";

type Props = {
  playlistId: string;
};

const CollectionSelect = ({ playlistId }: Props) => {
  const actions = useTrackActions();
  const playlist = actions.getPlaylist(playlistId);
  const collections = useTracksStore((state) => state.collections);
  if (!playlist) return null;
  const textColor = getTextColor(getColorLuminance(playlist.collection?.color).colorLuminance);

  // Filter out the collection that is already assigned to passed Playlist Id
  const possibleCollections = collections
    .filter((collection) => collection?.id !== playlist.collection?.id)
    .sort();

  return (
    <View className="flex flex-col">
      <View className="mb-2 pb-2 flex flex-row justify-start">
        <Text className="text-lg p-2">Current Collection</Text>
        <Animated.View
          layout={LightSpeedInRight}
          entering={BounceIn}
          exiting={LightSpeedOutRight}
          className="ml-4 py-1 px-3 border rounded-lg"
          style={{
            backgroundColor: playlist.collection?.color || "white",
          }}
        >
          <Text className="font-semibold text-lg border" style={{ color: textColor }}>
            {playlist.collection?.name}
          </Text>
        </Animated.View>
      </View>
      <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {possibleCollections.map((collection, index) => {
          let activeCollection = playlist.collection?.id === collection.id;

          return (
            <Animated.View
              layout={BounceIn}
              entering={FadeIn}
              exiting={FadeOut}
              key={collection.id}
            >
              <Pressable
                className="px-2 py-1 border mr-1 rounded-sm"
                style={{ backgroundColor: collection?.color || "white" }}
                onPress={() => actions.updatePlaylistFields(playlistId, { collection })}
              >
                <Text
                  className="p-2 font-semibold"
                  style={{
                    color: getTextColor(getColorLuminance(collection?.color).colorLuminance),
                  }}
                >
                  {collection?.name}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
};

export default CollectionSelect;

{
  /* <Pressable
            className="p-2 border mr-1"
            key={collection.id}
            onPress={() => actions.updatePlaylistFields(playlistId, { collection })}
          >
            <Text className="p-2">{collection?.name}</Text>
          </Pressable> */
}
