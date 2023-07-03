import { View, Text, ScrollView, Pressable } from "react-native";
import React from "react";
import { useDropboxStore } from "../store/store-dropbox";

const SettingsFolderMetadata = () => {
  const actions = useDropboxStore((state) => state.actions);
  const folderMetadata = useDropboxStore((state) => state.folderMetadata);

  return (
    <View>
      <Text>SettingsFolderMetadata</Text>
      <Pressable onPress={() => actions.clearFolderMetadata()}>
        <Text>Clear All</Text>
      </Pressable>
      <ScrollView>
        {Object.keys(folderMetadata).map((key) => {
          return (
            <View key={key} className="border-b border-amber-600 py-1 px-2">
              <Text className="text-sm font-semibold">
                {folderMetadata[key]?.title}
              </Text>
              <Text className="text-xs">{key}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default SettingsFolderMetadata;
