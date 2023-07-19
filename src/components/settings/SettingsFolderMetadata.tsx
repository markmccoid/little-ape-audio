import { View, Text, Pressable, StyleSheet } from "react-native";
import React, { useRef, useState } from "react";
import { useDropboxStore } from "../../store/store-dropbox";
import { colors } from "../../constants/Colors";
import {
  PanGestureHandlerProps,
  ScrollView,
} from "react-native-gesture-handler";

import MetadataRow from "./MetadataRow";
import { useSharedValue } from "react-native-reanimated";

const SettingsFolderMetadata = () => {
  const actions = useDropboxStore((state) => state.actions);
  const folderMetadata = useDropboxStore((state) => state.folderMetadata);
  const scrollRef = useRef<ScrollView>(null);
  const activeKey = useSharedValue(undefined);
  console.log("ACITVEKEY", activeKey.value);
  return (
    <>
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
      <ScrollView ref={scrollRef}>
        {Object.keys(folderMetadata).map((key) => {
          return (
            <MetadataRow
              folderMetadata={folderMetadata[key]}
              key={key}
              simultaneousHandler={scrollRef}
              currentKey={key}
              activeKey={activeKey}
            />
          );
        })}
      </ScrollView>
    </>
  );
};

export default SettingsFolderMetadata;
