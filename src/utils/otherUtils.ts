import * as WebBrowser from "expo-web-browser";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { useTracksStore } from "@store/store";

export const getImageFromWeb = async (playlistId, searchString) => {
  const trackActions = useTracksStore.getState().actions;
  let webURL = `https://www.google.com/search?q=${searchString} book&tbm=isch`;
  webURL = webURL.replace(/\s+/g, "%20");
  let result = await WebBrowser.openBrowserAsync(webURL);
  const hasImage = await Clipboard.hasImageAsync();
  if (hasImage) {
    const clipboardContent = await Clipboard.getImageAsync({
      format: "jpeg",
      jpegQuality: 0.5,
    });
    const aspectRatio = clipboardContent.size.width / clipboardContent.size.height;
    // const clipboardContent = await Clipboard.getStringAsync();
    //! The update Playlist fields function will only be called if an image
    //! was returned.
    await trackActions.updatePlaylistFields(playlistId, {
      imageURI: clipboardContent.data,
      imageAspectRatio: aspectRatio,
    });
    Clipboard.setStringAsync("");
  }
};

//~-=======================================
//~ Shares passed JSON using ios share option
//~-=======================================
export const shareJsonStringAsFile = async (jsonString: string, filename: string) => {
  // Create a temporary file to store the JSON string.
  const tempFileUri = `${FileSystem.cacheDirectory}${filename}.json`;

  // Write the JSON string to the temporary file.
  await FileSystem.writeAsStringAsync(tempFileUri, jsonString);

  // Share the temporary file using the Expo Sharing API.
  await Sharing.shareAsync(tempFileUri);
};
