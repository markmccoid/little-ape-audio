import { View, Text, Button } from "react-native";
import React from "react";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { getCleanFileName } from "@store/data/fileSystemAccess";
import { useTrackActions } from "@store/store";
import uuid from "react-native-uuid";
import { FileEntry } from "@utils/dropboxUtils";

const useLocalFiles = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const trackActions = useTrackActions();

  const selectLocalFiles = async () => {
    // Change type to "audio/*" to only show audio files
    try {
      let result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: "audio/*",
        copyToCacheDirectory: false,
      });

      //~ Not Cancelled.  Add selected files to a playlist
      if (!result.canceled) {
        // Create playlist (all files will go in same playlist)
        const playlistId = uuid.v4() as string;
        // User picked a file(s)
        setIsLoading(true);
        for (let file of result.assets) {
          const cleanFileName = getCleanFileName(file.name);
          const fileUri = `${FileSystem.documentDirectory}${cleanFileName}`;
          const ExsistingTrack = trackActions.getTrack(file.name);
          // If track Exists
          if (Boolean(ExsistingTrack)) {
            // Add existing track to playlist
            trackActions.addTracksToPlaylist(playlistId, [ExsistingTrack.id]);
          } else {
            // Copy file to local directory
            await FileSystem.copyAsync({ from: file.uri, to: fileUri });
            // Add new Track to store and playlist
            await trackActions.addNewTrack({
              fileURI: cleanFileName,
              filename: file.name,
              sourceLocation: file.uri,
              playlistId: playlistId,
              pathIn: "",
              currFolderText: "",
              audioSource: "local",
            });
          }
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.log("Error in Apple files", error);
    }
  };
  return [isLoading, selectLocalFiles] as [boolean, () => Promise<void>];
};

export default useLocalFiles;
