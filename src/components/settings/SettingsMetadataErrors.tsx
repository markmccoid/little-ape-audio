import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { useDropboxStore } from "@store/store-dropbox";

const SettingsMetadataErrors = ({ closeShowErrors }) => {
  const folderMetadataErrors = useDropboxStore(
    (state) => state.folderMetadataErrors
  );
  const clearMetadataError = useDropboxStore(
    (state) => state.actions.clearMetadataError
  );
  return (
    <View>
      <View className="flex-row ml-2 mt-1">
        <TouchableOpacity
          onPress={() => {
            clearMetadataError();
            closeShowErrors();
          }}
          className="px-2 py-1 bg-red-600 border border-red-900 rounded-md"
        >
          <Text className="font-semibold text-white">Clear Errors</Text>
        </TouchableOpacity>
      </View>
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
              <Text className="font-semibold mt-1">Error</Text>
              <Text>{JSON.stringify(error?.error)}</Text>
              {/* <Text>{error.folderName}</Text> */}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default SettingsMetadataErrors;
