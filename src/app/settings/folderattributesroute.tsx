import { View, Text, ScrollView, Pressable, TouchableOpacity, Image } from "react-native";
import React from "react";
import { useDropboxStore } from "@store/store-dropbox";
import { BookIcon, EmptyMDHeartIcon, MDHeartIcon, ReadIcon } from "@components/common/svg/Icons";

const folderattributesroute = () => {
  const folderAttributes = useDropboxStore((state) => state.folderAttributes);
  const { updateFolderAttribute } = useDropboxStore((state) => state.actions);

  return (
    <View>
      <ScrollView style={{ margin: 10 }}>
        <View>
          {folderAttributes?.map((attribute) => {
            return (
              <View
                key={attribute.id}
                className={`border p-2 mb-2 flex flex-row justify-start ${
                  attribute.audioSource === "google" ? "bg-amber-400" : "bg-blue-400"
                }`}
              >
                <Image
                  source={{ uri: attribute.imageURL || attribute.defaultImage }}
                  style={{ width: 100, height: 120 }}
                  className="rounded-lg mr-3"
                />
                <View className="flex flex-col flex-grow">
                  <Text>{attribute.title}</Text>
                  <Text>{attribute.author}</Text>
                </View>

                <View className="flex flex-col items-center justify-between">
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
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default folderattributesroute;
