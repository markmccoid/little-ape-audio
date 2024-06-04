import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import React from "react";
import { ABSGetLibraryItems } from "@store/data/absAPI";
import { getCoverURI } from "@store/data/absUtils";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { formatSeconds } from "@utils/formatUtils";

type Unpacked<T> = T extends (infer U)[] ? U : T;
type Props = {
  book: Unpacked<ABSGetLibraryItems>;
  index: number;
};
const ABSResultsBookRow = ({ book, index }: Props) => {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: [`${book.id}-cover`],
    queryFn: async () => await getCoverURI(book.cover),
  });

  return (
    <View
      className={`flex flex-row bg-amber-50 py-1`}
      style={{
        borderTopWidth: index === 0 ? StyleSheet.hairlineWidth : 0,
        borderBottomWidth: StyleSheet.hairlineWidth,
      }}
    >
      <View className="m-2">
        <Image
          source={{ uri: data || book.cover }}
          style={{ width: 80, height: 80, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth }}
        />
      </View>

      <Pressable
        onPress={() =>
          router.navigate({
            pathname: `audio/dropbox/audiobookshelf/${book.id}`,
            params: { title: book.title },
          })
        }
        className="flex-row flex-1"
      >
        <View className="flex-col ml-2 mt-2 flex-1">
          <View className="flex-row ">
            <Text
              lineBreakMode="tail"
              numberOfLines={2}
              className="flex-1 text-base font-semibold text-amber-950"
            >
              {book.title}
            </Text>
          </View>
          <View className="flex-row ">
            <Text lineBreakMode="tail" numberOfLines={2} className="flex-1 text-amber-900">
              by {book.author}
            </Text>
          </View>
          <View className="flex-row ">
            <Text className="text-amber-900">Duration:</Text>
            <Text className="text-amber-900 font-semibold">{formatSeconds(book.duration)}</Text>
          </View>
          <View className="flex-row ">
            <Text className="font-semibold text-amber-950">{book.publishedYear}</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

export default ABSResultsBookRow;
