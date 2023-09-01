import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState } from "react";
import { useDropboxStore } from "../../store/store-dropbox";
import { colors } from "../../constants/Colors";
import { PanGestureHandlerProps, FlatList } from "react-native-gesture-handler";

import MetadataRow from "./MetadataRow";
import { useSharedValue } from "react-native-reanimated";
import SettingsMetadataErrors from "./SettingsMetadataErrors";

const SettingsFolderMetadata = () => {
  const actions = useDropboxStore((state) => state.actions);
  const folderMetadata = useDropboxStore((state) => state.folderMetadataArray);
  const folderMetadataErrors = useDropboxStore(
    (state) => state.folderMetadataErrors
  );
  const flatListRef = React.createRef<FlatList>();
  const activeKey = useSharedValue(undefined);
  const [showErrors, setShowErrors] = useState(false);
  return (
    <>
      {folderMetadataErrors?.length > 0 && (
        <View className="flex-row justify-center mr-2 mt-1">
          <TouchableOpacity
            onPress={() => setShowErrors((prev) => !prev)}
            className="px-2 py-1  bg-red-600 border border-red-900 rounded-md"
          >
            <Text className="text-base font-semibold text-white">{`${
              showErrors ? "Hide Errors" : "Show Errors"
            }`}</Text>
          </TouchableOpacity>
        </View>
      )}
      {showErrors ? (
        <SettingsMetadataErrors />
      ) : (
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
          <FlatList
            ref={flatListRef}
            data={folderMetadata}
            renderItem={({ item }) => (
              <View className="border px-2 py-1">
                <Text>{item.id}</Text>
                <Text>{item.dropboxPathLower}</Text>
                <Text>
                  {item.categoryOne} - {item.categoryTwo}
                </Text>
              </View>
            )}
          />
        </>
      )}
      {/* <ScrollView ref={scrollRef}>
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
      </ScrollView> */}
    </>
  );
};

export default SettingsFolderMetadata;
