import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDropboxStore } from "@store/store-dropbox";
import { CleanBookMetadata } from "@utils/audiobookMetadata";
import { sortBy, debounce } from "lodash";
import { customEncodeParens } from "@utils/otherUtils";

const foldermetadatamodal = () => {
  const { pathInKey } = useLocalSearchParams();
  const router = useRouter();
  const folderMetadata = useDropboxStore((state) => state.folderMetadata);
  const [detailArray, setDetailArray] =
    useState<(CleanBookMetadata & { key: string })[]>(undefined);
  const [results, setResults] = useState<(CleanBookMetadata & { key: string })[]>([]);
  const [title, setTitle] = useState("");

  const dbSearch = React.useCallback(
    debounce((title, detailArray) => searchTitle(title, detailArray), 300),
    []
  );
  useEffect(() => {
    const detailObj = folderMetadata?.[pathInKey];
    if (!detailObj) return;
    const details = Object.keys(detailObj).map((key) => {
      return {
        key,
        ...detailObj[key],
      };
    });
    setDetailArray(sortBy(details, ["title"]));
    setResults(sortBy(details, ["title"]));
  }, []);

  useEffect(() => {
    if (detailArray) {
      dbSearch(title, detailArray);
    }
  }, [title, detailArray]);

  const searchTitle = (searchTerm: string, detailArray) => {
    if (!detailArray) return;
    if (searchTerm === "") {
      setResults(detailArray);
      return;
    }

    const authorBooks = detailArray.filter((el) => el.author.includes(searchTerm));
    const titleBooks = detailArray.filter((el) => el.title.includes(searchTerm));
    setResults([...titleBooks, ...authorBooks]);
  };

  return (
    <View className="mx-1">
      <Text className="self-center font-semibold text-base p-2">{pathInKey}</Text>
      <View className="flex-col">
        <Text>Title Search</Text>
        <TextInput
          value={title}
          onChangeText={(e) => setTitle(e)}
          className="bg-white p-2 border"
        />
      </View>
      <ScrollView style={{ marginBottom: 150 }}>
        {results?.length > 0 &&
          results?.map((el) => {
            return (
              <View key={el.key} className="border rounded-md bg-indigo-100 mb-1 pb-1">
                <TouchableOpacity
                  onPress={() => {
                    router.push({
                      pathname: `/settings/${customEncodeParens(el.key)}`,
                      params: {
                        fullPath: customEncodeParens(el.dropboxPathLower),
                        backTitle: "Back",
                        audioSource: el.audioSource,
                        parentFolderId: el.parentFolderId,
                      },
                    });
                  }}
                >
                  <View className="p-2 pb-1 border flex-col bg-indigo-300">
                    <Text className="font-semibold">{`${el.title}`}</Text>
                    <Text className="font-semibold">{`${el.author}`}</Text>
                  </View>
                </TouchableOpacity>
                <Text className="px-2 pt-1">{`${el.categoryOne} --> ${el.categoryTwo}`}</Text>
                <Text className="px-2 pt-1">{`${el.dropboxPathLower}`}</Text>
                <Text className="px-2 pt-1">{`${el.categories}`}</Text>

                <Text
                  className=" px-2 pt-1"
                  // numberOfLines={1}
                  // ellipsizeMode="tail"
                >{`IMAGEURL -> ${el.imageURL}\n${el.defaultImage}\n${el.localImageName}`}</Text>
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
};

export default foldermetadatamodal;
