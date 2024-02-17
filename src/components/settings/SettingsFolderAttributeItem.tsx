import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { FolderAttributeItem, useDropboxStore } from "@store/store-dropbox";
import { BookIcon, MDHeartIcon, ReadIcon } from "@components/common/svg/Icons";

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
          uri: attribute.imageURL.replace(/^http:\/\//, "https://") || attribute.defaultImage,
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
                updateFolderAttribute(
                  attribute.id,
                  "isFavorite",
                  "remove",
                  attribute.pathToFolder,
                  attribute.audioSource,
                  attribute?.parentFolder
                )
              }
            >
              <MDHeartIcon color="red" size={30} />
            </TouchableOpacity>
          )}
        </View>
        <View>
          {attribute?.isRead && (
            <TouchableOpacity
              className=""
              onPress={() =>
                updateFolderAttribute(
                  attribute.id,
                  "isRead",
                  "remove",
                  attribute.pathToFolder,
                  attribute.audioSource,
                  attribute?.parentFolder
                )
              }
            >
              <View>
                <BookIcon color="green" size={30} />
                <ReadIcon style={{ position: "absolute", top: 2, left: 5 }} size={20} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default SettingsFolderAttributeItem;
