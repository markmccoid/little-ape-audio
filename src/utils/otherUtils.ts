import * as WebBrowser from "expo-web-browser";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { getColors } from "react-native-image-colors";
import { IOSImageColors } from "react-native-image-colors/build/types";
import { PlaylistImageColors } from "@store/types";

export const getImageFromWeb = async (searchString: string) => {
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
    const imageColors = (await getImageColors(clipboardContent.data)) as PlaylistImageColors;
    // const imageColors = (await getColors(clipboardContent.data, {
    //   quality: "highest",
    // })) as IOSImageColors;
    // const clipboardContent = await Clipboard.getStringAsync();
    //! The update Playlist fields function will only be called if an image
    //! was returned.
    Clipboard.setStringAsync("");
    return {
      imageURI: clipboardContent.data,
      imageAspectRatio: aspectRatio,
      imageColors,
    };
  }
};

//~-=======================================
//~ Need to do more work for tintColor.  Need first pass to
//~ do colorTypes
//~ secondPass will need to look at color type and grab the darkest.
//~ maybe update getColorLuminance, to return an object
//~ { isDark: bookean, darkness: number}
//~-=======================================
type ColorObj = Record<
  string,
  {
    color: string;
    colorType: "dark" | "light";
    colorLuminance: number;
    tintColor: string;
  }
>;

//~ ------------------------------------------
//~ getImageColors
//~ ------------------------------------------
export const getImageColors = async (imagedata: string): Promise<PlaylistImageColors> => {
  const iosImageColors = (await getColors(imagedata, {
    quality: "highest",
  })) as IOSImageColors;
  let imageColors = { ...iosImageColors } as IOSImageColors;
  let darkestColor = { color: "black", darkness: 0 };
  let lightestColor = { color: "white", lightness: 255 };
  // Create Color Obj
  const colorObj: ColorObj = Object.keys(imageColors).reduce((fin, key, idx) => {
    if (key === "quality" || key === "platform") return fin;
    const { colorType, colorLuminance } = getColorLuminance(imageColors[key]);

    if (colorType === "dark") {
      if (darkestColor?.darkness || 500 > colorLuminance) {
        darkestColor = { color: imageColors[key], darkness: colorLuminance };
      }
    }
    if (colorType === "light") {
      if (lightestColor?.lightness || 0 < colorLuminance) {
        lightestColor = { color: imageColors[key], lightness: colorLuminance };
      }
    }

    fin = {
      ...fin,
      [key]: {
        color: imageColors[key],
        colorType: colorType,
        colorLuminance,
        // second pass will correct these tint colors
        tintColor: colorType === "dark" ? "ffffff" : "000000",
      },
    };

    return fin;
  }, {});

  // We need to go back through and update the tint colors based on the colorType
  // and then assigning lightest or darkest color
  let newObj;
  Object.keys(colorObj).forEach((key) => {
    const colorType = colorObj[key].colorType;
    const isDark = colorType === "dark";
    const foregroundLum = isDark ? lightestColor?.lightness : darkestColor?.darkness;
    const foregroundDefault = isDark ? lightestColor?.color : darkestColor?.color;
    const foregroundOverrid = isDark ? "white" : "black";
    const contrast = getContrast(foregroundLum, colorObj[key].colorLuminance);
    // If contrast between fore and back ground luminance, then just use black or white
    const tintColor = contrast < 0.7 ? foregroundOverrid : foregroundDefault;

    newObj = {
      ...newObj,
      [key]: {
        ...colorObj[key],
        tintColor, // : colorType === "dark" ? lightestColor?.color : darkestColor?.color,
      },
    };
  });

  return { darkestColor: darkestColor?.color, lightestColor: lightestColor?.color, ...newObj };
};
//~-=======================================
//~ Take a Hex color in and return whetner
//~ the passed color is "dark" or "light"
//~-=======================================
export const getColorLuminance = (backgroundColor: string) => {
  if (!backgroundColor) return { colorType: "dark", colorLuminance: 160 };
  // Convert the hex color to RGB.
  const rgb = hexToRgb(backgroundColor);
  // Calculate the luminance of the background color.
  const luminance = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  // Choose the best text color based on the luminance.

  return luminance > 150
    ? { colorType: "light", colorLuminance: luminance }
    : { colorType: "dark", colorLuminance: luminance };
};
// Function to convert a hex color to RGB.
function hexToRgb(hexColor: string) {
  const r = parseInt(hexColor.substring(1, 3), 16);
  const g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);
  return [r, g, b];
}
//~-=======================================
//~- return "white" or "black" for the text
//~~ color that should work on a color with the passed luminance
//~-=======================================
export const getTextColor = (bgLuminance: number) => {
  const whiteTextcontrast = (255 - bgLuminance) / 255;
  if (whiteTextcontrast >= 0.7) return "white";
  return "black";
};
//~- Get contrast between two color
export const getContrast = (foregroundLuminance: number, bg2Luminance: number) => {
  const contrast = (foregroundLuminance - bg2Luminance) / foregroundLuminance;
  return contrast;
};
//~~========================================
//~~ Lighten and Darken color functions
//~~========================================
export const lightenColor = (hexColor: string, magnitude: number) => {
  hexColor = hexColor.replace(`#`, ``);
  if (hexColor === "white") {
    hexColor = "ffffff";
  }
  if (hexColor === "black") {
    hexColor = "000000";
  }
  if (hexColor.length === 6) {
    const decimalColor = parseInt(hexColor, 16);
    let r = (decimalColor >> 16) + magnitude;
    r > 255 && (r = 255);
    r < 0 && (r = 0);
    let g = (decimalColor & 0x0000ff) + magnitude;
    g > 255 && (g = 255);
    g < 0 && (g = 0);
    let b = ((decimalColor >> 8) & 0x00ff) + magnitude;
    b > 255 && (b = 255);
    b < 0 && (b = 0);
    return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
  } else {
    return hexColor;
  }
};

export const darkenColor = (hexColor: string, magnitude: number) => {
  hexColor = hexColor.replace(`#`, ``);
  if (hexColor === "white") {
    hexColor = "ffffff";
  }
  if (hexColor === "black") {
    hexColor = "000000";
  }
  if (hexColor.length === 6) {
    const decimalColor = parseInt(hexColor, 16);
    let r = (decimalColor >> 16) - magnitude;
    r > 255 && (r = 255);
    r < 0 && (r = 0);
    let g = (decimalColor & 0x0000ff) - magnitude;
    g > 255 && (g = 255);
    g < 0 && (g = 0);
    let b = ((decimalColor >> 8) & 0x00ff) - magnitude;
    b > 255 && (b = 255);
    b < 0 && (b = 0);
    return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
  } else {
    return hexColor;
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
