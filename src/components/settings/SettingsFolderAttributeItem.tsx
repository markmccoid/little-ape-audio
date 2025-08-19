import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { FolderAttributeItem, useDropboxStore } from "@store/store-dropbox";
import { SymbolView } from "expo-symbols";
import { colors } from "@constants/Colors";
import { absSetBookToFinished } from "@store/data/absAPIOLD";

type Props = { attribute: FolderAttributeItem };
const SettingsFolderAttributeItem = ({ attribute }: Props) => {
  const { updateFolderAttribute } = useDropboxStore((state) => state.actions);

  return (
    <View
      key={attribute.id}
      className={`border mb-2 flex flex-row justify-start rounded-lg ${
        attribute.audioSource === "google" ? "bg-amber-400" : "bg-blue-400"
      }`}
    >
      <Image
        source={{
          uri: attribute?.imageURL
            ? attribute.imageURL.replace(/^http:\/\//, "https://")
            : attribute.defaultImage,
        }}
        style={{
          width: 100,
          height: 120,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: 10,
        }}
        className="rounded-lg m-2 mr-3 p-2"
      />
      <View className="flex flex-col flex-1 m-2">
        <Text>{attribute.title}</Text>
        <Text>{attribute.author}</Text>
      </View>

      <View className="flex flex-col items-center justify-between border-l p-2 rounded-r-lg bg-blue-200">
        <View>
          {attribute?.isFavorite && (
            <TouchableOpacity
              onPress={() =>
                updateFolderAttribute({
                  id: attribute.id,
                  type: "isFavorite",
                  action: "remove",
                  folderNameIn: attribute.pathToFolder,
                  audioSource: attribute.audioSource,
                  parentFolderId: attribute?.parentFolder,
                })
              }
            >
              <SymbolView
                name="heart.fill"
                style={{ width: 30, height: 28 }}
                type="monochrome"
                tintColor={colors.deleteRed}
              />
            </TouchableOpacity>
          )}
        </View>
        <View>
          {attribute?.isRead && (
            <TouchableOpacity
              className=""
              onPress={async () => {
                updateFolderAttribute({
                  id: attribute.id,
                  type: "isRead",
                  action: "remove",
                  folderNameIn: attribute.pathToFolder,
                  audioSource: attribute.audioSource,
                  parentFolderId: attribute?.parentFolder,
                });

                // await absSetBookToFinished(attribute.pathToFolder, false);
                // queryClient.invalidateQueries({ queryKey: ["allABSBooks"] });
              }}
            >
              <View>
                <SymbolView
                  name="checkmark.square.fill"
                  style={{ width: 31, height: 30 }}
                  type="hierarchical"
                  tintColor="green"
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default SettingsFolderAttributeItem;
