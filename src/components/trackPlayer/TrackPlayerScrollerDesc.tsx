import { View, Text, ScrollView, StyleSheet } from "react-native";
import React from "react";
import { usePlaybackStore, useTracksStore } from "@store/store";
import { AudioTrack, Playlist } from "@store/types";
import usePlaylistColors from "hooks/usePlaylistColors";
import HTMLToMarkdown from "@components/dropbox/AudiobookShelf/book/HTMLToMarkdown";

type Props = {
  playlist: Playlist;
  currentTrack: AudioTrack;
  compHeight: number;
};
const TrackPlayerScrollerDesc = ({ playlist, currentTrack, compHeight }: Props) => {
  // const currTrack = usePlaybackStore((state) => state.currentTrack);
  // const track = useTracksStore().actions.getTrack(currTrack.id);
  // console.log(currTrack.id);
  const plColors = usePlaylistColors();

  const textColor = plColors.background.tintColor;
  const bgColor = plColors.background.color;
  const descTextColor = plColors.secondary.tintColor;
  const descbgColor = plColors.secondary.color;

  return (
    <ScrollView
      className="bg-white rounded-md"
      style={{
        borderWidth: StyleSheet.hairlineWidth,
        height: compHeight,
        backgroundColor: bgColor,
      }}
      contentContainerStyle={{}}
    >
      <View className="p-1">
        <DescriptionTextLine
          label="Track Title:"
          text={currentTrack?.metadata?.title}
          textColor={textColor}
        />
        <DescriptionTextLine
          label="Narrated By:"
          text={currentTrack?.externalMetadata?.narratedBy}
          textColor={textColor}
        />
        <DescriptionTextLine
          label="Genre(s):"
          text={currentTrack?.externalMetadata?.genres}
          textColor={textColor}
        />
        <DescriptionTextLine
          label="Download Date:"
          text={currentTrack?.externalMetadata?.dateDownloaded}
          textColor={textColor}
        />
        <DescriptionTextLine
          label="Source:"
          text={
            currentTrack?.externalMetadata?.audioSource === "abs"
              ? "AudiobookShelf"
              : currentTrack?.externalMetadata?.audioSource
          }
          textColor={textColor}
        />
      </View>
      <View className="w-full h-[1] mt-1 mb-1 bg-gray-200 rounded-md" />
      <View className="p-1 ">
        <Text className="font-semibold text-base" style={{ color: textColor }}>
          Description:
        </Text>
      </View>
      <View className="mr-1 ml-1 p-1 rounded-md" style={{ backgroundColor: descbgColor }}>
        {/* <Text style={{ color: descTextColor }}>{currentTrack?.externalMetadata?.description}</Text> */}
        <HTMLToMarkdown html={currentTrack?.externalMetadata?.description} />
      </View>
    </ScrollView>
  );
};

function DescriptionTextLine({
  label,
  text,
  textColor,
}: {
  label: string;
  text: string;
  textColor: string;
}) {
  if (!text) return null;
  return (
    <View className="flex-row mb-2">
      <Text className="font-semibold pr-1" style={{ color: textColor }}>
        {label}
      </Text>
      <Text className="flex-1" style={{ color: textColor }} numberOfLines={2} lineBreakMode="tail">
        {text}
      </Text>
    </View>
  );
}
export default TrackPlayerScrollerDesc;
