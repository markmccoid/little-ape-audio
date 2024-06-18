import { Image } from "react-native";
import { defaultImages, getRandomNumber } from "@store/storeUtils";
import { getImageSize } from "@utils/otherUtils";
import { useABSStore } from "@store/store-abs";
//~~ =======================================================
//~~ UTILS
//~~ =======================================================

// -- buildCoverURL
export const buildCoverURL = (itemId: string) => {
  const token = useABSStore.getState().userInfo.token;
  return `https://abs.mccoidco.xyz/api/items/${itemId}/cover?token=${token}`;
};

// -- getCoverURI
export const getCoverURI = async (coverURL: string): Promise<string> => {
  let cover: string;
  try {
    const coverRes = await getImageSize(coverURL);
    return coverURL;
  } catch (err) {
    const randomNum = getRandomNumber();
    const randomImageInfo = Image.resolveAssetSource(defaultImages[`image${randomNum}`]);
    const randomImageAspect = randomImageInfo.width / randomImageInfo.height;
    return randomImageInfo.uri;
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
