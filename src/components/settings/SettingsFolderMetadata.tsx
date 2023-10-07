import { View, Text, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useDropboxStore } from "../../store/store-dropbox";
import { colors } from "../../constants/Colors";
import { PanGestureHandlerProps, FlatList } from "react-native-gesture-handler";

import MetadataRow from "./MetadataRow";
import { useSharedValue } from "react-native-reanimated";
import SettingsMetadataErrors from "./SettingsMetadataErrors";
import { useRouter } from "expo-router";
import { DeleteIcon } from "@components/common/svg/Icons";

const SettingsFolderMetadata = () => {
  const route = useRouter();
  const actions = useDropboxStore((state) => state.actions);
  const folderMetadata = useDropboxStore((state) => state.folderMetadata);
  const [displayFMD, setDisplayFMD] = useState([]);
  const folderMetadataErrors = useDropboxStore((state) => state.folderMetadataErrors);
  const flatListRef = React.createRef<FlatList>();
  const activeKey = useSharedValue(undefined);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    setDisplayFMD(
      Object.keys(folderMetadata).map((key) => ({
        key,
        numberOfBooks: Object.keys(folderMetadata[key]).length,
      }))
    );
  }, [folderMetadata]);

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
        <SettingsMetadataErrors closeShowErrors={() => setShowErrors(false)} />
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
            data={displayFMD}
            extraData={folderMetadata}
            style={{ marginHorizontal: 10 }}
            renderItem={({ item }) => (
              <View className="border flex-row justify-between mb-1 h-[75] flex-1  bg-indigo-100">
                <TouchableOpacity
                  onPress={() =>
                    route.push({
                      pathname: "/settings/foldermetadatamodal",
                      params: {
                        pathInKey: item.key,
                      },
                    })
                  }
                  className="flex-grow"
                >
                  <View className="px-2 py-1 flex-col flex-1">
                    <View className="flex-row">
                      <Text className="font-semibold">Books: </Text>
                      <Text numberOfLines={1} ellipsizeMode="tail" className="flex-1">
                        {item.numberOfBooks}
                      </Text>
                    </View>
                    <View className="flex-row items-start">
                      <Text className="font-semibold text-base">Path: </Text>
                      <Text numberOfLines={2} className="text-base flex-1">
                        {item.key}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    await actions.removeFolderMetadataKey(item.key);
                  }}
                  className="border-l border-amber-800"
                  style={{ backgroundColor: colors.deleteRed }}
                >
                  <View className="px-2 py-1  flex justify-center items-center flex-grow">
                    <DeleteIcon color="white" />
                  </View>
                </TouchableOpacity>
                {/* <Text>{item.dropboxPathLower}</Text>
                <Text>
                  {item.categoryOne} - {item.categoryTwo}
                </Text> */}
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
