import { View, Text, StyleSheet, TouchableOpacity, Share } from "react-native";
import React, { ReactNode } from "react";
import * as Linking from "expo-linking";
import { SymbolView } from "expo-symbols";
import { colors } from "@constants/Colors";
import { AudioTrack } from "@store/types";
import { useTracksStore } from "@store/store";

/*
 * ABSShareBookProps will take the user to the abs book route in the app
 *
 */
interface ABSShareBookPropsProps {
  track: AudioTrack;
  style?: object;
}

const ABSShareBook: React.FC<ABSShareBookPropsProps> = ({ track, style }) => {
  const actions = useTracksStore((state) => state.actions);
  const bookId = actions.getABSBookId(track);
  console.log("BookId", bookId);
  return (
    <TouchableOpacity
      className="mt-1"
      onPress={async () => {
        try {
          const result = await Share.share({
            message: `${track.metadata.title} -> Open in LAAB -> ${Linking.createURL(
              `/dropbox/audiobookshelf/${bookId}`
            )}`,
            url: track.metadata.pictureURI,
          });
        } catch (e) {
          console.log("Error sharing", e.message);
        }
      }}
    >
      <SymbolView
        name="square.and.arrow.up"
        style={{ width: 25, height: 30 }}
        type="monochrome"
        tintColor={colors.abs950}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  link: {
    // Default styles can be added here
  },
});

export default ABSShareBook;
