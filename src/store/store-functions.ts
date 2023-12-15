// import { SetState, StateCreator, StoreApi } from "zustand";
import { getAudioFileTags } from "../utils/audioUtils";
import { saveToAsyncStorage } from "./data/asyncStorage";
import * as FileSystem from "expo-file-system";
import { AudioMetadata, AudioState, AudioTrack } from "./types";
import { getCleanFileName } from "@store/data/fileSystemAccess";
// import { getCleanFileName } from "./data/fileSystemAccess";
import { downloadDropboxFile } from "@utils/dropboxUtils";
import { format } from "date-fns";
import { getJsonData } from "@utils/googleUtils";
import { GDrive } from "@robinbobin/react-native-google-drive-api-wrapper";
import { PlaylistImageColors } from "@store/types";
import { getImageColors } from "@utils/otherUtils";
import TrackPlayer from "react-native-track-player";

const gdrive = new GDrive();

type AddTrack = AudioState["actions"]["addNewTrack"];
type ZSetGet<T> = {
  set: (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => void;
  get: () => T;
};

export type Chapter = {
  title: string;
  startSeconds: number;
  endSeconds: number;
  durationSeconds: number;
  startMilliSeconds?: number;
  endMilliSeconds?: number;
  lengthMilliSeconds?: number;
};
type LAABData = {
  fileName: string;
  album?: string;
  author?: string;
  albumArtist?: string;
  artist?: string;
  copyright?: string;
  genre?: string;
  narrator?: string;
  publisher?: string;
  publishingDate?: string;
  publishedYear?: string;
  recordingDate?: string;
  title?: string;
  chapters?: Chapter[];
};

export const addTrack =
  (set: ZSetGet<AudioState>["set"], get: ZSetGet<AudioState>["get"]): AddTrack =>
  async ({
    fileURI, // Clean filename including extension
    filename, // non cleaned filename including extension
    sourceLocation, // Either full path with filename or google fileId TO THE FILE
    pathIn, // This is the path or fileId to the **FOLDER** where the track was located.
    audioSource, // google or dropbox
    playlistId = undefined,
    directory = "",
  }) => {
    // variable for final tags
    let finalTags: AudioMetadata;
    // Get metadata for passed audio file
    const tags = (await getAudioFileTags(
      `${FileSystem.documentDirectory}${fileURI}`
    )) as AudioMetadata;
    // process track number info
    // let trackNum = tags.trackRaw;
    let trackNum: number | string = "";
    let totalTracks = undefined;
    const trackRaw = `${tags.trackRaw}`;
    if (trackRaw?.includes("/")) {
      const trackNumInfo = tags.trackRaw.split("/");
      trackNum = parseInt(trackNumInfo[0]) || "";
      totalTracks = trackNumInfo[1] || 1;
    } else {
      trackNum = parseInt(tags.trackRaw) || "";
    }
    // Track Raw End
    // Get picture colors if available
    if (tags.pictureURI) {
      const colors = (await getImageColors(tags.pictureURI)) as PlaylistImageColors;
      tags.pictureColors = colors;
    }

    // ------------------------------------
    // -- GET LAAB Metadata if it exists
    let LAABMeta: LAABData = undefined;
    if (audioSource === "dropbox") {
      LAABMeta = await laabMetaDropbox(sourceLocation, filename);
    } else if (audioSource === "google") {
      //! Google LaabMeta check
      const laabFileName = `${getCleanFileName(filename)}_laabmeta.json`;
      const laabData = await getJsonData({ folderId: pathIn, filename: laabFileName });

      if (laabData) {
        LAABMeta = createLAABMeta(laabData);
      } else {
        LAABMeta = undefined;
      }
    }

    //- merge LAABMeta with the final tag info, this only merges like keys
    //- adding chapters after
    if (LAABMeta) {
      finalTags = mergeObjects(LAABMeta, tags);
      if (LAABMeta?.chapters) {
        finalTags = { ...finalTags, chapters: LAABMeta.chapters };
      }
    } else {
      finalTags = tags;
    }
    //~~ LAAB END
    const finalTagInfo = {
      ...finalTags,
      trackNum,
      totalTracks,
    };
    const id = `${directory}${filename}`;
    const newAudioFile = {
      id,
      fileURI,
      directory,
      filename,
      sourceLocation,
      metadata: {
        ...finalTagInfo,
      },
    };
    // If title is blank then use filename
    newAudioFile.metadata.title = newAudioFile.metadata?.title || newAudioFile.filename;
    // Right now we do NOT allow any duplicate files (dir/filename)
    // remove the file ONLY FROM STORE if it exists.  By the time we are in the store
    // it has already been saved and that is fine.
    const filteredList = get().tracks.filter((el) => el.id !== id);

    // Add the new track to current track list
    const newAudioFileList = [...filteredList, newAudioFile];
    set({ tracks: newAudioFileList });
    //! ----- ----- ----- ----- ----- ----- -----
    //! This code is to only here to make the
    //! AudioCommonMetadataReceived event fire
    //! It will cause the chapter event to emit and then
    //! we can grab any chapter data found in the mp3 file
    //~ ONE Caveat, I am resetting the TrackPlayer, which means if
    //~ playlist is active it will be cleared.  Oh well.
    //~ We could probably use this techinique for the other metadata
    //~ but for now above works.
    //! ----- ----- ----- ----- ----- ----- -----
    const trackPlayerTrack = {
      id: `${filename}`,
      filename: `${filename}`,
      url: `${FileSystem.documentDirectory}${fileURI}`,
      duration: tags.durationSeconds,
    };

    await TrackPlayer.reset();
    await TrackPlayer.add([trackPlayerTrack]);
    await TrackPlayer.skip(0);
    // await TrackPlayer.seekTo(0);
    await new Promise((resolve) => setTimeout(resolve, 100));
    //!!!!!!!

    //! -- When a new track is added, we need to get the title and author
    //!    information.  This will be our Playlist name
    /**
     * PLAYLIST
     *  - id - uuid
     *  - title
     *  - author
     *  - tracks: []
     *  - currentTrack - trackId
     */
    // If no playlist ID passed, then assume single download and create new playlist
    // and add track
    const plName =
      newAudioFile.metadata?.album || newAudioFile.metadata?.title || newAudioFile.filename;
    const plAuthor = newAudioFile.metadata?.artist || "Unknown";
    const finalPlaylistId = get().actions.addNewPlaylist(plName, plAuthor, playlistId);
    await get().actions.addTracksToPlaylist(finalPlaylistId, [newAudioFile.id]);
    console.log("addTrack store-functions");
    await saveToAsyncStorage("tracks", newAudioFileList);
  };

//~~ -------------------------------------
//~~ MERGE objects, but only overwrite target key
//~~ if it is undefined
//~~ -------------------------------------
function mergeObjects(source, target) {
  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target?.[key];

    if (targetValue === undefined && target?.[key]) {
      console.log("Replacing Target", key, targetValue);
      target[key] = sourceValue;
    }
  }

  return target;
}

const laabMetaDropbox = async (sourceLocation: string, filename: string) => {
  //~~ Check for LAAB Meta file
  const laabPath = sourceLocation.slice(0, sourceLocation.lastIndexOf("/"));
  const laabFileName = `${getCleanFileName(filename)}_laabmeta.json`;
  const laabFileNameWithPath = `${laabPath}/${laabFileName}`;
  // const laabFileNameWithPath = `${laabPath}/${getCleanFileName(filename)}_laabmeta.json`;

  let LAABMeta: LAABData;
  // laab file contains chapter data sometimes
  try {
    const laabData = (await downloadDropboxFile(`${laabFileNameWithPath}`)) as LAABData;
    LAABMeta = createLAABMeta(laabData);
  } catch (err) {
    LAABMeta = undefined;
    // Assume the laab meta file was not found
    // console.log("Error in LAABMeta", err);
  }
  return LAABMeta;
};

const createLAABMeta = (laabData) => {
  const LAABMeta = {
    fileName: laabData?.fileName,
    // album: laabData?.album,
    // albumArtist: laabData?.albumArtist,
    author: laabData?.artist,
    // copyright: laabData?.copyright,
    // genre: laabData?.genre,
    narrator: laabData?.narrator,
    publisher: laabData?.publisher,
    publishedYear: laabData?.publishingDate
      ? format(new Date(laabData.publishingDate), "yyyy")
      : undefined,
    title: laabData?.title,
    chapters: verifyChapterData(laabData?.chapters),
  };
  // Get rid of undefined keys
  Object.keys(LAABMeta).forEach((key) => {
    if (!LAABMeta[key]) {
      delete LAABMeta[key];
    }
  });

  return LAABMeta;
};

//~ --------------------------------
//~ Works to make sure that the start seconds of the
//~ NEXT track is not the same as the end seconds of the PREV track
//~ --------------------------------
function verifyChapterData(chapterData: Chapter[]) {
  let prevEndSeconds = undefined;
  if (!chapterData) return undefined;
  // Check to see if start or end times are null, if so do NOT send back any chapt data.
  let chaptersMalformed = false;
  chapterData.forEach((chapt) => {
    if (
      chapt.endSeconds === undefined ||
      chapt.endSeconds === null ||
      chapt.startSeconds === undefined
    ) {
      chaptersMalformed = true;
    }
  });
  if (chaptersMalformed) return undefined;

  return chapterData.map((chapt) => {
    // if ANY chapter start or end is NULL, just return undefined

    if (chapt.startSeconds === prevEndSeconds) {
      prevEndSeconds = chapt.endSeconds;
      return {
        ...chapt,
        startSeconds: chapt.startSeconds + 1,
      };
    }
    prevEndSeconds = chapt.endSeconds;
    return chapt;
  });
}
