import * as FileSystem from "expo-file-system";
import * as jsmediatags from "./jsmediatags/jsmediatags";
import { TagType } from "jsmediatags/types";

const base64 = require("base-64");
import { AVPlaybackStatusSuccess, Audio } from "expo-av";
import { AudioMetadata, Chapters } from "../store/types";
import { Image } from "react-native";
import { getFileExtension } from "./otherUtils";

//--=================================
//-- getAudioFileTags
//--=================================
export const getAudioFileTags = async (fullFileURI: string) => {
  const fileExt = getFileExtension(fullFileURI);
  let durationSeconds = await getAudioFileDuration(fullFileURI);

  // fullFileURI is the full path to the audio file
  // It is expected to be in the apps storage, with the "file:///" in front
  // Strip the "file:///"

  const workingURI = fullFileURI.slice(8);
  let metadata: AudioMetadata = {
    durationSeconds,
  };
  try {
    const tag = (await jsMediaAsync(workingURI)) as TagType;
    // Get chapter information if any exists
    const chaptersInfo = processChapters(tag.tags?.CHAP as unknown as TagChapters[]);

    metadata = {
      title: tag.tags?.title,
      artist: tag.tags?.artist,
      album: tag.tags?.album,
      genre: tag.tags?.genre,
      trackRaw: tag.tags?.track,
      comment: tag.tags?.comment?.text,
      chapters: chaptersInfo?.chapterArray,
      year: isNaN(parseInt(tag.tags?.year)) ? undefined : parseInt(tag.tags?.year),
      durationSeconds: chaptersInfo?.duration || durationSeconds || 8000,
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
//-- processChapters
//--=================================
type Subframes = {
  id: string;
  // Title/Desc of chapter
  data: string;
  description: string;
  size: string;
};
type TagChapters = {
  id: string;
  description: string;
  size: number;
  data: {
    id: string;
    startTime: number;
    endTime: number;
    subFrames: Subframes;
    startOffset: number;
    endOffset: number;
  };
};
const processChapters = (
  chapters: TagChapters[]
): { duration: number; chapterArray: Chapters[] } => {
  if (!chapters || chapters?.length === 0) return undefined;
  // Get duration from the last chapter and coverting to seconds
  const duration = chapters[chapters.length - 1].data.endTime / 1000;

  // Bail if the endTime is not a number
  if (isNaN(chapters[chapters.length - 1]?.data?.endTime)) return undefined;

  let chapterArray = [];
  for (const chapter of chapters) {
    const chapterStartTime = chapter.data?.startTime / 1000;
    //! Subtracting one because each new chapter's start time is the same as the previous chapters end time
    const chapterEndTime = chapter.data?.endTime / 1000 - 1;
    const chapterDuration = chapterEndTime - chapterStartTime;
    const chapterDescription = chapter.data?.subFrames?.TIT2?.data;

    chapterArray.push({
      title: chapterDescription,
      startSeconds: Math.floor(chapterStartTime),
      startMilliSeconds: Math.floor(chapterStartTime) * 1000,
      endSeconds: Math.floor(chapterEndTime),
      endMilliSeconds: Math.floor(chapterEndTime) * 1000,
      durationSeconds: Math.floor(chapterDuration),
      lengthMilliSeconds: Math.floor(chapterDuration) * 1000,
    });
  }
  // console.log("chaparray", chapterArray);
  return {
    duration,
    chapterArray,
  };
};

//--=================================
//-- getAudioFileDuration
//--=================================
export const getAudioFileDuration = async (fileURI: string) => {
  const soundObj = new Audio.Sound();

  let info;
  try {
    info = await FileSystem.getInfoAsync(fileURI);
    await soundObj.loadAsync({ uri: `${fileURI}` });
    const metadata = (await soundObj.getStatusAsync()) as AVPlaybackStatusSuccess;

    const durationSeconds = metadata.durationMillis ? metadata.durationMillis / 1000 : 0;
    await soundObj.unloadAsync();
    return durationSeconds;
  } catch (err) {
    console.log("Error in getAudioFileDuration ->", err);
    return 0;
  }
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
