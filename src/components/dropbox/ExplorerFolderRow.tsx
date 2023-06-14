import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import React, { useState } from "react";
import { CleanBookMetadata } from "../../utils/audiobookMetadata";
import { colors } from "../../constants/Colors";
import { AnimateHeight } from "../common/animations/AnimateHeight";

type Props = {
  metadata: CleanBookMetadata;
  index: number;
};
const ExplorerFolderRow = ({ metadata, index }: Props) => {
  const [showDescription, setShowDescription] = useState(false);
  if (!metadata) return null;
  return (
    <View
      className="flex-1 flex-col"
      style={{
        backgroundColor: index % 2 === 0 ? colors.amber100 : colors.amber50,
      }}
    >
      <View className="flex-1 flex-row w-full justify-start">
        {/* **IMAGE** */}
        <Image
          source={metadata.imageURL}
          style={{
            width: 100,
            height: 100,
            resizeMode: "stretch",
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.amber900,
            borderRadius: 10,
            marginLeft: 10,
          }}
        />
        {/* **TITLE AUTHOR OTHER** */}
        <View
          className="flex flex-col pl-2 flex-grow"
          style={{
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.amber600,
          }}
        >
          <View className="flex flex-row">
            <Text
              className="flex-1 text-base font-semibold text-center pr-2"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {metadata.title}
            </Text>
          </View>

          <Text className="text-sm font-medium text-center">
            by {metadata.author}
          </Text>

          {metadata?.bookLength && <Text>{metadata.bookLength}</Text>}
          <Text>{metadata.publishedYear}</Text>
        </View>
      </View>
      {/* **DESCRIPTION** */}
      <TouchableOpacity onPress={() => setShowDescription((prev) => !prev)}>
        <Text>Desc</Text>
      </TouchableOpacity>
      <AnimateHeight hide={!showDescription} style={{ marginHorizontal: 5 }}>
        <Text>{metadata.description}</Text>
      </AnimateHeight>
    </View>
  );
};

export default ExplorerFolderRow;
