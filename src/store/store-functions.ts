// import { SetState, StateCreator, StoreApi } from "zustand";
import { getAudioFileTags } from "../utils/audioUtils";
import { saveToAsyncStorage } from "./data/asyncStorage";
import * as FileSystem from "expo-file-system";
import { AudioMetadata, AudioState } from "./types";
import { getCleanFileName } from "./data/fileSystemAccess";
import { downloadDropboxFile } from "@utils/dropboxUtils";
import { format } from "date-fns";
import { getGoogleDownloadLink } from "@utils/googleUtils";
import axios from "axios";

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
  startMilliSeconds: number;
  endMilliSeconds: number;
  lengthMilliSeconds: number;
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
    fileURI,
    filename,
    sourceLocation,
    pathIn,
    audioSource,
    playlistId = undefined,
    directory = "",
  }) => {
    // console.log("PathIn", pathIn, audioSource, fileURI);
    //!! TEST GOOGLE
    if (audioSource === "google") {
      const laabFile = await getGoogleDownloadLink({ folderId: pathIn, filename: laabFileName });
      console.log("google Laab file", laabFile.webContentLink);
      const laabJson = await axios.get(laabFile.webContentLink);
      const final = await JSON.parse(laabJson.data);
      console.log("LAAB JSON", laabJson);
      return;
    }

    //!!
    // variable for final tags
    let finalTags: AudioMetadata;
    // Get metadata for passed audio file
    const tags = (await getAudioFileTags(
      `${FileSystem.documentDirectory}${fileURI}`
    )) as AudioMetadata;
    // process track number info

    let trackNum = tags.trackRaw;
    let totalTracks = undefined;
    const trackRaw = `${tags.trackRaw}`;

    if (trackRaw?.includes("/")) {
      const trackNumInfo = tags.trackRaw.split("/");
      trackNum = trackNumInfo[0] || undefined;
      totalTracks = trackNumInfo[1] || undefined;
    }
    // Track Raw End
    //~~ Check for LAAB Meta file
    const laabPath = sourceLocation.slice(0, sourceLocation.lastIndexOf("/"));
    const laabFileName = `${getCleanFileName(filename)}_laabmeta.json`;
    const laabFileNameWithPath = `${laabPath}/${laabFileName}`;
    // const laabFileNameWithPath = `${laabPath}/${getCleanFileName(filename)}_laabmeta.json`;

    let LAABMeta: LAABData;
    // laab file contains chapter data sometimes
    try {
      const laabData = (await downloadDropboxFile(`${laabFileNameWithPath}`)) as LAABData;
      LAABMeta = {
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
        chapters: laabData?.chapters,
      };
      // Get rid of undefined keys
      Object.keys(LAABMeta).forEach((key) => {
        if (!LAABMeta[key]) {
          delete LAABMeta[key];
        }
      });
    } catch (err) {
      LAABMeta = undefined;
      // Assume the laab meta file was not found
      // console.log("Error in LAABMeta", err);
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
    const finalPlaylistId = await get().actions.addNewPlaylist(plName, plAuthor, playlistId);
    await get().actions.addTracksToPlaylist(finalPlaylistId, [newAudioFile.id]);

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
