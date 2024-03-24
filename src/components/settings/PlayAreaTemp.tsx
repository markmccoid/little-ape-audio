import { View, Text, Button } from "react-native";
import React from "react";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { getCleanFileName } from "@store/data/fileSystemAccess";
import { useTracksStore } from "@store/store";

const PlayAreaTemp = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const tracks = useTracksStore((state) => state.tracks);
  console.log(
    "Tracks::",
    tracks.map((track) => {
      delete track.metadata;
      return track;
    })
  );
  const pickDocument = async () => {
    // Change type to "audio/*" to only show audio files
    try {
      let result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: "audio/*",
        copyToCacheDirectory: false,
      });

      //!  NOW NEED TO RUN THROUGH THE LOADING TO A PLAYLIST, ETC
      if (!result.canceled) {
        // User picked a file
        setIsLoading(true);
        for (let file of result.assets) {
          console.log(file.name, file.mimeType, file.uri);
          const cleanFileName = getCleanFileName(file.name);
          const fileUri = `${FileSystem.documentDirectory}${cleanFileName}`;
          await FileSystem.copyAsync({ from: file.uri, to: fileUri });
          const info = await FileSystem.getInfoAsync(fileUri);
          console.log("file info", info);
        }
        setIsLoading(false);
        // const fileUri = result.assets[0].uri;
        // const fileType = result.assets[0].mimeType;
        // const fileName = result.assets[0].name;

        // You can now access the file using fileUri
        // For example, you can read the file contents or upload it to a server
        // console.log("Selected file:", fileName, fileType, fileUri);
      }
    } catch (error) {
      console.log("Error in apple files", error);
    }
  };

  return (
    <View>
      {isLoading && <Text className="text-lg">Loading...</Text>}
      <Text>PlayAreaTemp</Text>
      <Text>Dynamic</Text>
      <Button title="Pick File" onPress={pickDocument} />
    </View>
  );
};

export default PlayAreaTemp;
