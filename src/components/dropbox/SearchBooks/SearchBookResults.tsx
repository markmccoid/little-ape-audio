import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import React from "react";
import { FlatFolderMetadata } from "./SearchBooksSearch";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";

type Props = { resultData: FlatFolderMetadata };
const SearchBookResults = ({ resultData }: Props) => {
  const router = useRouter();
  return (
    <View>
      <FlatList
        renderItem={({ item }) => {
          const imageURL = item?.imageURL
            ? item.imageURL
            : item?.localImageName
            ? `${FileSystem.documentDirectory}${item.localImageName}`
            : item.defaultImage;

          return (
            <TouchableOpacity
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
              <View className="flex-row border border-amber-900">
                <Image source={{ uri: imageURL }} style={{ width: 100, height: 100 }} />
                <Text>{item.title}</Text>
                <Text>{item.author}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(el) => el.id}
        data={resultData}
      />
    </View>
  );
};

export default SearchBookResults;
