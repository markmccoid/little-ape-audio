import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import React from "react";
import { useDropboxStore } from "../store/store-dropbox";
import { colors } from "../constants/Colors";

const SettingsFolderMetadata = () => {
  const actions = useDropboxStore((state) => state.actions);
  const folderMetadata = useDropboxStore((state) => state.folderMetadata);

  return (
    <View>
      <View className="flex-row m-2">
        <Pressable
          onPress={() => actions.clearFolderMetadata()}
          className="p-2 bg-amber-400 rounded-md"
          style={{
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.amber900,
          }}
        >
          <Text>Clear All</Text>
        </Pressable>
      </View>
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
