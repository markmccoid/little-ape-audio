import * as FileSystem from "expo-file-system";
import * as jsmediatags from "./jsmediatags/jsmediatags";
import { TagType } from "jsmediatags/types";

const base64 = require("base-64");
import { AVPlaybackStatusSuccess, Audio } from "expo-av";
import { AudioMetadata } from "../store/types";
import { Image } from "react-native";

//--=================================
//-- getAudioFileTags
//--=================================
export const getAudioFileTags = async (fullFileURI: string) => {
  const durationSeconds = await getAudioFileDuration(fullFileURI);
  // fullFileURI is the full path to the audio file
  // It is expected to be in the apps storage, with the "file:///" in front
  // Strip the "file:///"

  const workingURI = fullFileURI.slice(8);
  let metadata: AudioMetadata = {
    durationSeconds,
  };
  try {
    const tag = (await jsMediaAsync(workingURI)) as TagType;
    console.log(
      "META",
      tag.tags.CHAP[1].data.subFrames,
      tag.tags.CHAP[2].data.subFrames
    );
    metadata = {
      title: tag.tags?.title,
      artist: tag.tags?.artist,
      album: tag.tags?.album,
      genre: tag.tags?.genre,
      trackRaw: tag.tags?.track,
      year: isNaN(parseInt(tag.tags?.year))
        ? undefined
        : parseInt(tag.tags?.year),
      durationSeconds: durationSeconds,
      pictureURI: undefined,
      pictureAspectRatio: undefined,
    };
    if (tag.tags.picture) {
      const { data, format } = tag.tags.picture;

      try {
        let base64StringStart = "";
        for (let i = 0; i < data.length; i++) {
          base64StringStart += String.fromCharCode(data[i]);
        }
        const base64String = base64.encode(base64StringStart);

        const uri = `data:${format};base64,${base64String}`;
        // Create a new property on teh metadata that is the aspect ratio of the image
        // aspectRatio = width/height
        const { width, height, aspectRatio } = await getImageSize(uri);
        let pictureAspectRatio = undefined;
        if (width > 0 && height > 0) {
          pictureAspectRatio = width / height;
        }
        metadata.pictureURI = uri;
        metadata.pictureAspectRatio = pictureAspectRatio;
        // updateBase64Image(uri);
      } catch (err) {
        console.log("ERROR GETTING IMAGE", err);
      }
    }
  } catch (e) {
    console.log("ERROR IN TAGS", e);
  }

  return metadata;
};

//--=================================
//-- getAudioFileDuration
//--=================================
export const getAudioFileDuration = async (fileURI: string) => {
  const soundObj = new Audio.Sound();
  await soundObj.loadAsync({ uri: `${fileURI}` });
  const metadata = (await soundObj.getStatusAsync()) as AVPlaybackStatusSuccess;
  const durationSeconds = metadata.durationMillis
    ? metadata.durationMillis / 1000
    : 0;
  await soundObj.unloadAsync();
  return durationSeconds;
};

/**
 * Making the jsmediatags library async/await compatible
 * @param path
 * @returns
 */
export const jsMediaAsync = async (path: string) => {
  return new Promise((resolve, reject) => {
    new jsmediatags.Reader(path).read({
      onSuccess: (tag) => {
        // console.log("Success!");
        resolve(tag);
      },
      onError: (error) => {
        console.log("Error");
        reject(error);
      },
    });
  });
};

//--=================================
//-- getImageSize
//--=================================
export const getImageSize = async (
  uri: string
): Promise<{ width: number; height: number; aspectRatio: number }> => {
  const promise = new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => {
        resolve({ width, height, aspectRatio: width / height });
      },
      // reject
      (err) => resolve({ width: undefined, height: undefined })
    );
  });

  return (await promise) as {
    width: number;
    height: number;
    aspectRatio: number;
  };
};
