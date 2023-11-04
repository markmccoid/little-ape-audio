import { View, Text, TouchableOpacity, Image, StyleSheet, Pressable } from "react-native";
import React, { useState } from "react";
import { CleanBookMetadata } from "../../utils/audiobookMetadata";
import { colors } from "../../constants/Colors";
import { AnimateHeight } from "../common/animations/AnimateHeight";
import { PowerIcon } from "../common/svg/Icons";
import { MotiText, MotiView } from "moti";
import * as FileSystem from "expo-file-system";
import ExplorerImage from "./ExplorerImage";

type Props = {
  metadata: CleanBookMetadata;
  showMetadata?: boolean;
  index: number;
};
const ExplorerFolderRow = ({ metadata, showMetadata = false, index }: Props) => {
  const [showDescription, setShowDescription] = useState(false);
  // const [imgDims, setImgDims] = useState({ width: 0, height: 0 });
  // console.log("FOLDER ROW", showMetadata, !metadata);
  if (!metadata || !showMetadata) return null;

  return (
    <View
      className="flex-1 flex-col "
      style={{
        backgroundColor: index % 2 === 0 ? colors.amber100 : colors.amber50,
      }}
    >
      <View className="flex-1 flex-row w-full justify-start">
        {/* **IMAGE** */}
        <ExplorerImage metadata={metadata} width={100} />

        {/* **TITLE AUTHOR OTHER** */}
        <View
          className="flex flex-col pl-2 flex-grow"
          style={{
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.amber300,
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

          <View className="flex-row justify-center">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="flex-1 text-sm font-medium text-center pr-2"
            >
              {`${metadata?.author ? `by ${metadata.author}` : ""}`}
            </Text>
          </View>

          <View>
            {/* **Book Length** */}
            {metadata?.bookLength && <Text className="text-center">{metadata.bookLength}</Text>}
            {/* **Pub Year** */}
            {!!metadata?.publishedYear && (
              <Text className="text-center">{metadata?.publishedYear}</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default ExplorerFolderRow;
