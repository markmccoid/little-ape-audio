import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import { CleanBookMetadata } from "../../utils/audiobookMetadata";
import { colors } from "../../constants/Colors";
import { AnimateHeight } from "../common/animations/AnimateHeight";
import { PowerIcon } from "../common/svg/Icons";
import { MotiText, MotiView } from "moti";
import ExplorerImage from "./ExplorerImage";

type Props = {
  metadata: Partial<CleanBookMetadata>;
};
const FileMetadataView = ({ metadata }: Props) => {
  if (!metadata) return null;

  return (
    <View
      className={`items-start flex-col justify-start border-b border-b-amber-900 pb-2 pt-2`}
      style={{
        backgroundColor: colors.amber100,
      }}
    >
      <View className="flex-grow flex-row w-full justify-start ">
        {/* **IMAGE** */}
        <ExplorerImage metadata={metadata} width={100} />

        {/* **TITLE AUTHOR OTHER** */}
        <View
          className="flex flex-col pl-2 flex-grow "
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
              by {metadata.author}
            </Text>
          </View>

          <View>
            {/* **Book Length** */}
            {metadata?.bookLength && (
              <Text className="text-center">{metadata.bookLength}</Text>
            )}
            {/* **Pub Year** */}
            <Text className="text-center">{metadata.publishedYear}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default FileMetadataView;
