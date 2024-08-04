import { View, Text, Pressable, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import React from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { absGetItemDetails } from "@store/data/absAPI";
import ABSErrorView from "@components/dropbox/AudiobookShelf/ABSErrorView";
import { useGetSeriesBooks } from "@store/data/absHooks";
import { colors } from "@constants/Colors";
import { BackIcon, IOSArrowForwardIcon } from "@components/common/svg/Icons";
import IOSBack from "@components/common/svg/IOSBack";
import ABSResultsBookRow from "@components/dropbox/AudiobookShelf/ABSResultsBookRow";
import { AnimatedPressable } from "@components/common/buttons/Pressables";

const SeriesRoute = () => {
  const dynamicParam = useLocalSearchParams();
  const router = useRouter();
  const bookid = dynamicParam.bookid as string;

  const { series, isError, isLoading, error } = useGetSeriesBooks(bookid);
  // const { data, isError, isLoading, error } = useQuery({
  //   queryKey: [bookid],
  //   queryFn: async () => await absGetItemDetails(bookid),
  // });

  if (isError) {
    return <ABSErrorView error={error} />;
  }
  if (isLoading) {
    <View>
      <Text>isloading...</Text>
    </View>;
  }
  //!! Currently just showing FIRST series books
  const currSeries = series[0];
  // return (
  //   <View>
  //     <Text>{JSON.stringify(series)}</Text>
  //   </View>
  // );
  return (
    <SafeAreaView className="flex-1 bg-abs-50">
      <View className="flex-col bg-abs-50 flex-1">
        {/* <Text>Series ID - {currSeries.id}</Text> */}
        {/* Header Bar */}
        {/* <Pressable onPress={router.back}> */}
        <AnimatedPressable onPress={router.back}>
          <View
            className="flex-row p-2 bg-abs-300 px-2 justify-between items-center rounded-t-lg"
            style={{
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.abs950,
            }}
          >
            <IOSBack strokeColor={colors.abs900} />
            <View className="pr-3" />
            <Text
              numberOfLines={1}
              lineBreakMode="tail"
              className="flex-1 font-semibold text-lg text-center text-abs-900"
            >
              {currSeries.name}
            </Text>
          </View>
        </AnimatedPressable>
        {/* <Text className="text-center text-abs-800"></Text> */}
        <ScrollView className="flex-1 " contentContainerStyle={{}}>
          {currSeries.books.map((book, index) => {
            return (
              <ABSResultsBookRow
                key={book.id}
                book={book}
                index={index}
                includeSeriesLink={false}
              />
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default SeriesRoute;
