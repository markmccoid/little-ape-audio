import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import React from "react";
import { AudioFile, Media } from "@store/data/absTypes";

type Props = {
  audioFiles: AudioFile[];
  media: Media;
  coverURI: string;
};

const formatAuthors = (authorsObj: { id: string; name: string }[]) => {
  return authorsObj.map((el) => el.name).join(", ");
};
const ABSBookContainer = ({ audioFiles, media, coverURI }: Props) => {
  console.log("BOOKID", media.libraryItemId);
  const authors = formatAuthors(media.metadata.authors);
  return (
    <View className="flex-col">
      <View className="flex flex-row justify-start items-start border-b bg-yellow-500 py-1">
        <Image
          source={{ uri: coverURI }}
          style={{
            width: 150,
            height: 150,
            borderRadius: 10,
            borderWidth: StyleSheet.hairlineWidth,
            marginLeft: 8,
          }}
        />
        <View className="flex flex-col flex-1 mx-2">
          <Text
            numberOfLines={2}
            lineBreakMode="tail"
            className="text-base  text-amber-950 font-semibold"
          >
            {media.metadata.title}
          </Text>

          <Text
            numberOfLines={2}
            lineBreakMode="tail"
            className="text-sm  text-amber-900 font-semibold"
          >
            by {authors}
          </Text>
          <Text className="text-sm  text-amber-900 font-semibold">
            Published {media.metadata.publishedYear}
          </Text>
        </View>
      </View>
      <Text>HI = {authors}</Text>
      <ScrollView>
        {audioFiles.map((audio) => {
          console.log("INO", audio.ino, media.libraryItemId);
          return (
            <View key={audio.ino}>
              <Text>{audio.ino}</Text>

              <Text>{audio.metadata.filename}</Text>
            </View>
          );
        })}
      </ScrollView>
      {/* <Text>{audio.ino}</Text>
      <Text>{audio.metadata.filename}</Text> */}
    </View>
  );
};

export default ABSBookContainer;
