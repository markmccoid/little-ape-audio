import { View, Text, Image, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { ABSGetLibraryItems } from "@store/data/absAPI";
import { getCoverURI } from "@store/data/absUtils";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { formatSeconds } from "@utils/formatUtils";
import { DurationIcon, SeriesIcon } from "@components/common/svg/Icons";
import { colors } from "@constants/Colors";

type Unpacked<T> = T extends (infer U)[] ? U : T;
type Props = {
  book: Unpacked<ABSGetLibraryItems>;
  index: number;
  includeSeriesLink?: boolean;
};
const ABSResultsBookRow = ({ book, index, includeSeriesLink = true }: Props) => {
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: [`${book.id}-cover`],
    queryFn: async () => (await getCoverURI(book.cover)).coverURL,
  });
  const showSeriesLink = book?.series && includeSeriesLink;
  const showInlineSeries = book?.series;

  return (
    <View className="flex-col">
      <View
        className={`flex flex-row bg-abs-50`}
        style={{
          borderTopWidth: index === 0 ? StyleSheet.hairlineWidth : 0,
          borderBottomWidth: !showSeriesLink && StyleSheet.hairlineWidth,
        }}
      >
        <View className="m-2">
          {!isLoading && (
            <Image
              source={{ uri: data || book.cover }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 10,
                borderWidth: StyleSheet.hairlineWidth,
              }}
            />
          )}
          {isLoading && (
            <Image
              source={{ uri: data || book.cover }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 10,
                borderWidth: StyleSheet.hairlineWidth,
              }}
            />
          )}
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
          <View className="flex-col ml-2 mt-1 flex-1 justify-between mb-2">
            <View className="flex-col">
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
              {showInlineSeries && (
                <View className="flex-row items-center justify-start">
                  <SeriesIcon size={16} color={colors.amber800} />
                  <Text
                    lineBreakMode="tail"
                    numberOfLines={2}
                    className="flex-1 text-amber-900 ml-1 text-xs pt-[3]"
                  >
                    {book.series}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row justify-between mr-2">
              <View className="flex-row ">
                <DurationIcon size={16} color={colors.amber900} />
                <Text className="text-amber-800 ml-1">
                  {` ${formatSeconds(book.duration, "verbose_no_seconds", true, false)}`}
                </Text>
              </View>
              <Text className=" font-semibold text-amber-700">{book.publishedYear}</Text>
            </View>
          </View>
        </Pressable>
      </View>
      {showSeriesLink && (
        <TouchableOpacity
          onPress={() => router.push(`/audio/dropbox/audiobookshelf/series/${book.id}`)}
        >
          <View
            className="flex-row items-center justify-start px-2 py-1"
            style={{
              borderBottomWidth: StyleSheet.hairlineWidth,
              // borderTopWidth: StyleSheet.hairlineWidth,
            }}
          >
            <SeriesIcon size={16} color={colors.amber800} />
            <Text
              lineBreakMode="tail"
              numberOfLines={2}
              className="flex-1 text-amber-900 ml-1 text-xs pt-[3]"
            >
              {book.series}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const ABSResultsBookRowMemo = React.memo(ABSResultsBookRow);
export default ABSResultsBookRowMemo;
