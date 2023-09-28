import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useDropboxStore } from "@store/store-dropbox";
import { CleanBookMetadata } from "@utils/audiobookMetadata";

const foldermetadatamodal = () => {
  const { pathInKey } = useLocalSearchParams();
  const folderMetadata = useDropboxStore((state) => state.folderMetadata);
  const [detailArray, setDetailArray] = useState<(CleanBookMetadata & { key: string })[]>([]);

  useEffect(() => {
    const detailObj = folderMetadata?.[pathInKey];
    if (!detailObj) return;
    setDetailArray(
      Object.keys(detailObj).map((key) => {
        return {
          key,
          ...detailObj[key],
        };
      })
    );
  }, []);
  return (
    <View className="mx-1">
      <Text className="font-semibold text-baser">{pathInKey}</Text>
      <ScrollView style={{ marginBottom: 50 }}>
        {detailArray.length > 0 &&
          detailArray.map((el) => {
            return (
              <View key={el.key} className="p-2 border rounded-md bg-indigo-100 mb-1">
                <View className="pb-1 border-b">
                  <Text>{`KEY -> ${el.key}`}</Text>
                </View>
                <Text className="pt-1">{`IMAGEURL -> ${el.imageURL}`}</Text>
                <Text className="pt-1">{`Cat ONE -> ${el.categoryOne}`}</Text>
                <Text className="pt-1">{`Cat TWO -> ${el.categoryTwo}`}</Text>
                {/* <Text>{JSON.stringify(el)}</Text> */}
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
};

export default foldermetadatamodal;
