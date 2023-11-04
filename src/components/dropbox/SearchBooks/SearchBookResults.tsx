import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { FlatFolderMetadata } from "./SearchBooksSearch";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import { colors } from "@constants/Colors";

type Props = { resultData: FlatFolderMetadata };
const SearchBookResults = ({ resultData }: Props) => {
  const router = useRouter();
  const renderItem = ({ item }) => {
    const imageURL = item?.imageURL
      ? item.imageURL
      : item?.localImageName
      ? `${FileSystem.documentDirectory}${item.localImageName}`
      : item.defaultImage;

    return (
      <View
        className="flex-row bg-white w-full rounded-lg mb-2"
        key={item.id}
        style={{
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.amber950,
        }}
      >
        <View
          className="flex-col bg-white justify-start rounded-l-lg"
          // style={styles.shadow}
          style={{
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.amber950,
          }}
        >
          <Image
            style={{ width: 50, height: 72 }}
            source={{ uri: imageURL }}
            className="rounded-l-lg"
          />
        </View>

        <TouchableOpacity
          className="rounded-r-lg flex-grow"
          onPress={() =>
            router.push({
              pathname: `/audio/dropbox/${item.title}`,
              params: {
                fullPath: item.dropboxPathLower,
                backTitle: "Back",
              },
            })
          }
        >
          <View className="flex-row justify-start flex-grow mb-1 rounded-r-lg">
            <View className="flex-col justify-start flex-grow rounded-r-lg">
              <View className="bg-amber-500 rounded-t-lg rounded-l-none flex-grow">
                <Text className="font-semibold text-sm pl-3">
                  {item.categoryOne} - {item.categoryTwo}
                </Text>
              </View>
              <Text className="text-base font-bold px-2" style={{}}>
                {item.title}
              </Text>
              <Text className="text-base px-2" style={{}}>
                by {item.author}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <View>
      <FlatList
        style={{ marginBottom: 180 }}
        renderItem={renderItem}
        keyExtractor={(el) => el.id}
        data={resultData}
      />
    </View>
  );
};

export default SearchBookResults;