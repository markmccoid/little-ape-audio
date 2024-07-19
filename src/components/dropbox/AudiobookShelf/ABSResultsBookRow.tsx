import { View, Text, Image, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { ABSGetLibraryItems } from "@store/data/absAPI";
import { getCoverURI } from "@store/data/absUtils";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { formatSeconds } from "@utils/formatUtils";
import {
  BookIcon,
  DurationIcon,
  MDHeartIcon,
  ReadIcon,
  SeriesIcon,
} from "@components/common/svg/Icons";
import { colors } from "@constants/Colors";
import { useDropboxStore } from "@store/store-dropbox";

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
        className={`flex flex-row`}
        style={[
          styles.baseContainer,
          index !== 0 && styles.noBorderTop,
          showSeriesLink && styles.noBorderBottom,
          book.isFinished && styles.finishedBook,
        ]}
      >
        <View className="m-2">
          {!isLoading && <Image source={{ uri: data || book.cover }} style={styles.image} />}
          {isLoading && <Image source={{ uri: data || book.cover }} style={styles.image} />}
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
                <View className="flex-row items-center justify-start bg-red">
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
            <View className="flex-row justify-between mr-2 items-center">
              <View className="flex-row ">
                <DurationIcon size={16} color={colors.amber900} />
                <Text className="text-amber-800 ml-1">
                  {` ${formatSeconds(book.duration, "verbose_no_seconds", true, false)}`}
                </Text>
              </View>
              <Text className=" font-semibold text-amber-700">{book.publishedYear}</Text>
              {book.isFinished && (
                <View>
                  <BookIcon color="green" size={20} />
                  <ReadIcon style={{ position: "absolute", top: 2, left: 5 }} size={10} />
                </View>
              )}
              {book.isFavorite ? (
                <View>
                  <MDHeartIcon color="red" size={20} />
                </View>
              ) : (
                <View>
                  <MDHeartIcon color="red" size={20} style={{ display: "none" }} />
                </View>
              )}
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
            style={[styles.bottomHairline, book.isFinished && styles.finishedBook]}
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

const styles = StyleSheet.create({
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bottomHairline: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  baseContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: "#faf1da",
  },
  finishedBook: {
    backgroundColor: "#d7f3e3",
  },
  noBorderTop: {
    borderTopWidth: 0,
  },
  noBorderBottom: {
    borderBottomWidth: 0,
  },
});
const ABSResultsBookRowMemo = React.memo(ABSResultsBookRow);
export default ABSResultsBookRowMemo;
