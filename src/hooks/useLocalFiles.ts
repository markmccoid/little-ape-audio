import { View, Text, Button } from "react-native";
import React from "react";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { getCleanFileName } from "@store/data/fileSystemAccess";
import { useTrackActions } from "@store/store";
import uuid from "react-native-uuid";

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
          const exsistingTrack = trackActions.getTrack(file.name);
          // If track Exists use existing track (location) for playlist
          if (Boolean(exsistingTrack)) {
            //!!! Playlist won't exist if this track was processed first
            //!! Need to run-> tractActions.addNewPlaylist(plName, plAuthor, playlistId)
            // sending in undefined for name and author so that we DON'T find any existing playlist and use
            // the passed id.
            const finalPlaylistId = trackActions.addNewPlaylist(undefined, undefined, playlistId);
            // update the name and author.  Realize if multiple tracks are selected with different metadata,
            // this will update for each and we are left with the last one. NOTE: undefined values don't update.
            await trackActions.updatePlaylistFields(finalPlaylistId, {
              name: exsistingTrack?.metadata?.album || exsistingTrack?.metadata?.title,
              author: exsistingTrack?.metadata?.artist,
            });
            // Add existing track to playlist
            trackActions.addTracksToPlaylist(finalPlaylistId, [exsistingTrack.id]);
          } else {
            //! NEW TRACK
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
