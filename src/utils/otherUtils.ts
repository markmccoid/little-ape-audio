import * as WebBrowser from "expo-web-browser";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { useTracksStore } from "@store/store";
import { getColors } from "react-native-image-colors";
import { IOSImageColors } from "react-native-image-colors/build/types";

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
    const imageColors = (await getColors(clipboardContent.data, {
      quality: "highest",
    })) as IOSImageColors;
    // const clipboardContent = await Clipboard.getStringAsync();
    //! The update Playlist fields function will only be called if an image
    //! was returned.
    await trackActions.updatePlaylistFields(playlistId, {
      imageURI: clipboardContent.data,
      imageAspectRatio: aspectRatio,
      imageColors,
    });
    Clipboard.setStringAsync("");
  }
};

//~-=======================================
//~ Take a Hex color in and return whetner
//~ black or white text would be best on top
//~-=======================================
export const chooseTextColor = (backgroundColor: string) => {
  // Convert the hex color to RGB.
  const rgb = hexToRgb(backgroundColor);
  // Calculate the luminance of the background color.
  const luminance = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  // Choose the best text color based on the luminance.
  return luminance > 150 ? "black" : "white";
};
// Function to convert a hex color to RGB.
function hexToRgb(hexColor: string) {
  const r = parseInt(hexColor.substring(1, 3), 16);
  const g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);
  return [r, g, b];
}

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
