import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import React from "react";
import { useDropboxStore } from "@store/store-dropbox";
import { ScrollView } from "react-native-gesture-handler";
import { Link, useRouter } from "expo-router";
import { colors } from "@constants/Colors";

const ShowFavoritedBooks = () => {
  // const dropboxActions = useDropboxStore(state => state.actions)
  // const favBooks = useFavoriteBooks();
  const favBooks = useDropboxStore((state) => state.favoritedBooks);
  const router = useRouter();
  return (
    <ScrollView
      style={{ flexGrow: 1 }}
      // contentContainerStyle={{ flex: 1, width: "100%", height: "100%" }}
    >
      {favBooks?.map((book) => {
        return (
          <View
            className="flex-1 bg-white w-full h-[60]"
            key={book.id}
            style={{
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.amber900,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: `/audio/dropbox/favBook`,
                  params: {
                    fullPath: book.dropboxPathLower,
                    backTitle: "Back",
                  },
                })
              }
            >
              <View className="flex-row justify-start w-full">
                <View className="flex-col bg-amber-500 justify-end">
                  <Image
                    style={{ width: 50, height: 55 }}
                    source={book.imageURL}
                  />
                </View>
                <View className="flex-col justify-start w-full ">
                  <Text className="font-semibold text-sm pl-3 bg-amber-500">
                    {book.categoryOne} - {book.categoryTwo}
                  </Text>
                  <Text
                    className="text-base font-bold px-2"
                    style={{ marginTop: -3 }}
                  >
                    {book.title}
                  </Text>
                  <Text className="text-base px-2" style={{ marginTop: -5 }}>
                    by {book.author}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
};

export default ShowFavoritedBooks;