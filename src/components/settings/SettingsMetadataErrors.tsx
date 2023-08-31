import { View, Text, ScrollView } from "react-native";
import React from "react";
import { useDropboxStore } from "@store/store-dropbox";

const SettingsMetadataErrors = () => {
  const folderMetadataErrors = useDropboxStore(
    (state) => state.folderMetadataErrors
  );

  return (
    <ScrollView>
      {folderMetadataErrors?.map((error, index) => {
        return (
          <View
            key={index}
            className="flex-col mb-1 p-2 border-b border-amber-900"
          >
            <Text className="font-semibold">Metadata Name</Text>
            <Text>{error.metadataFileName}</Text>
            <Text className="font-semibold mt-1">Dropbox Path</Text>
            <Text>{error.dropboxPath}</Text>
            {/* <Text>{error.folderName}</Text> */}
          </View>
        );
      })}
    </ScrollView>
  );
};

export default SettingsMetadataErrors;
