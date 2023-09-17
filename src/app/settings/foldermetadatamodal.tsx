import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useDropboxStore } from "@store/store-dropbox";

const foldermetadatamodal = () => {
  const { pathInKey } = useLocalSearchParams();
  const folderMetadata = useDropboxStore((state) => state.folderMetadata);
  const [detailArray, setDetailArray] = useState([]);

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
    <View>
      <Text className="font-semibold text-baser">{pathInKey}</Text>
      <ScrollView>
        {detailArray.length > 0 &&
          detailArray.map((el) => {
            return (
              <View key={el.key}>
                <Text>{el.key}</Text>
                <Text>{el.imageURL}</Text>
                {/* <Text>{JSON.stringify(el)}</Text> */}
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
};

export default foldermetadatamodal;
