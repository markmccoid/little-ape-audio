import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useTempStore, useTrackActions, useTracksStore } from "@store/store";
import { getColorLuminance, getTextColor } from "@utils/otherUtils";
import TempAnimationTest from "./TempAnimationTest";

const PlaylistCollectionSetup = () => {
  const router = useRouter();
  const trackActions = useTrackActions();
  const collections = useTracksStore((state) => state.collections);
  //!! Need to figure out how to use the color on the collection if it exists,
  //!! but still allow for the color to come in from picker when updated
  //!! How about 1. store useTempStore color in TempColor, then in useEffect
  //!! triggered by change in tempColor, we update the playlists collection color
  //!! Then we will always use teh playlist collection color for the default, if empty default to black
  const color = useTempStore((state) => state.color);
  const textColor = getTextColor(getColorLuminance(color).colorLuminance);
  const [collectionName, setCollectionName] = useState();

  console.log("Collections", collections);
  return <TempAnimationTest />;
  return (
    <View className="flex-row justify-between ">
      {/* <ScrollView horizontal>
        {collections.map((collection) => (
          <View key={collection.id} className="p-2 border">
            <Text>{collection.name}</Text>
          </View>
        ))}
      </ScrollView> */}
      {/* <TextInput
        className="p-2 border w-[150]"
        value={collectionName}
        onChangeText={(text) => setCollectionName(text)}
      />
      <Pressable
        onPress={() =>
          trackActions.updatePlaylistFields(playlistId, {
            collection: { name: collectionName, type: "audiobook", color: color },
          })
        }
        className="flex-grow py-3"
      >
        <Text>Update</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push({ pathname: "/audio/colorpickermodal" })}
        className={`p-3 border`}
        style={{ backgroundColor: color }}
      >
        <Text style={{ color: textColor }} className="font-semibold">
          Color Picker
        </Text>
      </Pressable> */}
    </View>
  );
};

export default PlaylistCollectionSetup;
