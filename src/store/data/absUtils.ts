import { Image } from "react-native";
import { defaultImages, getImageIndex, getRandomNumber } from "@store/storeUtils";
import { getImageSize } from "@utils/otherUtils";
import { useABSStore } from "@store/store-abs";
import { getAbsURL } from "./absAPI";
//~~ =======================================================
//~~ UTILS
//~~ =======================================================

// -- buildCoverURL
export const buildCoverURL = (itemId: string) => {
  const token = useABSStore.getState().userInfo.token;
  return `${getAbsURL()}/api/items/${itemId}/cover?token=${token}`;
};

// -- getCoverURI
export const getCoverURI = async (
  coverURL: string
): Promise<{ coverURL: string; type: "passthrough" | "localasset" }> => {
  let cover: string;
  try {
    const coverRes = await getImageSize(coverURL);
    return { coverURL, type: "passthrough" };
  } catch (err) {
    // Using the passed coverURL (if it doesn't exist), hash it to a a number/index
    // This allows us to use the same image for each file (hashed on its)
    const hashImageIndex = getImageIndex(coverURL);
    // console.log("hashImageIndex", hashImageIndex);
    const randomImageInfo = Image.resolveAssetSource(defaultImages[`image${hashImageIndex}`]);
    const randomImageAspect = randomImageInfo.width / randomImageInfo.height;
    return { coverURL: randomImageInfo.uri, type: "localasset" };
  }
};

// -- buildFilePathLower builds a key to be used when adding an audio file from abs
export const buildFilePathLower = (bookId: string, audioIno: string) => {
  return `${bookId}~${audioIno}`;
};

// -- splitFilePathLower return the bookId and audio ino from the passed abs filepath
export const splitFilePathLower = (absFilePathLower: string) => {
  const split = absFilePathLower.split("~");
  return {
    bookId: split[0],
    AudioIno: split[1],
  };
};
