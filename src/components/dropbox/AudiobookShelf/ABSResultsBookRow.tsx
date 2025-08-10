import { View, Text, Image, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { ABSGetLibraryItems } from "@store/data/absAPI";
import { getCoverURI } from "@store/data/absUtils";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { formatSeconds } from "@utils/formatUtils";
import { SymbolView, SymbolViewProps, SFSymbol } from "expo-symbols";
import { DurationIcon, SeriesIcon } from "@components/common/svg/Icons";
import { colors } from "@constants/Colors";
import { LinearGradient } from "expo-linear-gradient";

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
          //  book.isFinished && styles.finishedBook,
        ]}
      >
        <Pressable
          onPress={() =>
            router.navigate({
              pathname: `(audio)/dropbox/audiobookshelf/${book.id}`,
              params: { title: book.title },
            })
          }
        >
          <View className="m-2">
            {!isLoading && <Image source={{ uri: data || book.cover }} style={styles.image} />}
            {isLoading && <Image source={{ uri: data || book.cover }} style={styles.image} />}
          </View>
        </Pressable>

        <Pressable
          onPress={() =>
            router.navigate({
              pathname: `(audio)/dropbox/audiobookshelf/${book.id}`,
              params: { title: book.title },
            })
          }
          className="flex-row flex-1"
        >
          <View className="flex-col ml-2 mt-1 flex-1 justify-between mb-2">
            <View className="flex-col">
              {/* Book Title */}
              <View className="flex-row ">
                <Text
                  lineBreakMode="tail"
                  numberOfLines={2}
                  className="flex-1 text-base font-semibold text-amber-950"
                >
                  {book.title}
                </Text>
              </View>
              {/* Book Author */}
              <View className="flex-row ">
                <Text lineBreakMode="tail" numberOfLines={2} className="flex-1 text-amber-900">
                  by {book.author}
                </Text>
              </View>
              {/* CONDITIONAL Series */}
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
            {/* Duration / Year / isRead / isFavorite */}
            <View className="flex-row justify-between mr-2 items-center">
              <View className="flex-row ">
                <DurationIcon size={16} color={colors.amber900} />
                <Text className="text-amber-800 ml-1">
                  {` ${formatSeconds(book.duration, "verbose_no_seconds", true, false)}`}
                </Text>
              </View>
              <View className="flex-row mx-2">
                <Text className="mr-3 font-semibold text-amber-700">{book.publishedYear}</Text>
                {book.isFinished ? (
                  <View>
                    <SymbolView
                      name="checkmark.square.fill"
                      style={{ width: 21, height: 20 }}
                      type="hierarchical"
                      tintColor="green"
                    />
                    {/* <CheckSquareIcon color="green" size={20} /> */}
                    {/* <ReadIcon style={{ position: "absolute", top: 2, left: 5 }} size={10} /> */}
                  </View>
                ) : (
                  <View className="w-[21]" />
                )}
                {book.isFavorite ? (
                  <View className="ml-2">
                    {/* <MDHeartIcon color="red" size={20} /> */}
                    <SymbolView
                      name="heart.fill"
                      style={{ width: 20, height: 18 }}
                      type="monochrome"
                      tintColor={colors.deleteRed}
                    />
                  </View>
                ) : (
                  <View className="ml-2 w-[20]" />
                )}
              </View>
            </View>
          </View>
        </Pressable>
      </View>
      {showSeriesLink && (
        <TouchableOpacity
          onPress={() => router.push(`/(audio)/dropbox/audiobookshelf/series/${book.id}`)}
        >
          <LinearGradient
            colors={[colors.abs100, colors.abs300]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View
              className="flex-row items-center justify-start px-2 py-1"
              style={[styles.bottomHairline, book.isFinished && styles.finishedBook]}
            >
              <SeriesIcon size={16} color={colors.amber800} />
              <Text
                lineBreakMode="tail"
                numberOfLines={2}
                className="flex-1 text-amber-950 ml-1 text-xs pt-[3]"
              >
                {book.series}
              </Text>
            </View>
          </LinearGradient>
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
