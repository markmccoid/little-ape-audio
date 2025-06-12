// import { SetState, StateCreator, StoreApi } from "zustand";
import { getAudioFileTags } from "../utils/audioUtils";
import { saveToAsyncStorage } from "./data/asyncStorage";
import * as FileSystem from "expo-file-system";
import { AudioMetadata, AudioState, AudioTrack, ExternalMetadata } from "./types";
import { downloadToFileSystem, getCleanFileName } from "@store/data/fileSystemAccess";
// import { getCleanFileName } from "./data/fileSystemAccess";
import { downloadDropboxFile } from "@utils/dropboxUtils";
import { format } from "date-fns";
import { getJsonData } from "@utils/googleUtils";
import { GDrive } from "@robinbobin/react-native-google-drive-api-wrapper";
import { PlaylistImageColors } from "@store/types";
import { getImageColors, resolveABSImage, sanitizeString } from "@utils/otherUtils";
import TrackPlayer from "react-native-track-player";
import { BookJSONMetadata, CleanBookMetadata, cleanOneBook } from "@utils/audiobookMetadata";
import { buildCoverURL, getCoverURI } from "./data/absUtils";
import { absGetItemDetails, absGetUserInfo } from "./data/absAPI";
let isCriticalSectionLocked = false;
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
    sourceLocation, // Dropbox - full path with filename; Google - fileId TO THE FILE; abs - itemId~fileIno
    pathIn, // Dropbox - the base path to file; Google - fileId to the **FOLDER** where the track was located; abs - itemId of Book
    currFolderText, // This is the name of the folder where the track was located. This will be the text and not an id if in google
    audioSource, // google or dropbox or abs
    playlistId = undefined,
    calculateColor = false,
    totalAudioFiles,
    directory = "",
  }) => {
    //!! ----------
    // Check if the critical section is locked; if it is, wait and try again later
    // If global var is true, we will loop on this until it is not true, then continue.
    //!!
    // console.log(`${filename}-ADD TRACK LOCK`, Date.now());
    while (isCriticalSectionLocked) {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Adjust the timeout as needed
    }
    //!!
    // console.log(`${filename}-ADD TRACK START`, Date.now());
    //~ -- If not locked - SET locked and move onto the function
    isCriticalSectionLocked = true;
    // variable for final tags
    let finalTags: AudioMetadata;
    // Get metadata for passed audio file
    // console.log("Get Tags Start", Date.now());
    const tags = (await getAudioFileTags(
      `${FileSystem.documentDirectory}${fileURI}`
    )) as AudioMetadata;
    // console.log("Get Tags END", Date.now());

    // process track number info
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
    // If "abs" source and no metadata picture, use image from audiobookshelf

    // -- externalMetadata can come from the 'title...'-metadata.json file if it exists and
    // -- store on track object in externalMetadata property.
    // -- OR in the case of ABS, it will come from abs details
    let externalMetadata: ExternalMetadata = undefined;

    if (audioSource === "abs") {
      if (!tags.pictureURI) {
        //
        const coverLink = buildCoverURL(pathIn);
        //! NOTE: I can build a coverURL for any book even if it has no associated cover
        //!  the getCoverURI function will return a random image (type: "localasset") if coverURL is a 404
        const coverURIInfo = await getCoverURI(coverLink);
        //!! If type is passthrough then NOT a local asset image, so download it
        if (coverURIInfo.type === "passthrough") {
          const { uri, cleanFileName } = await downloadToFileSystem(
            coverURIInfo.coverURL + "&format=jpeg",
            `abs_${pathIn}.jpeg`
          );
          tags.pictureURI = cleanFileName;
        } else {
          tags.pictureURI = coverURIInfo.coverURL;
        }
      }
      // Get chapter details by downloading book details and finding the audio ino
      // that we are processing.  Then grab chapters
      const results = await absGetItemDetails(pathIn);
      const currentIno = sourceLocation.split("~")[1];
      // if ABS, then our playlistId is the bookId
      playlistId = sourceLocation.split("~")[0];
      const currentAudio = results.audioFiles.find((file) => file.ino === currentIno);
      if (totalAudioFiles > 1) {
        tags.durationSeconds = currentAudio.duration;
        const absChapters = absChapterConvert(currentAudio.chapters);
        tags.chapters = absChapters;
      } else {
        const chapters = results.media.chapters;
        const absChapters = absChapterConvert(chapters);
        tags.chapters = absChapters;
        tags.durationSeconds = currentAudio.duration;
      }
      // Results book info
      // console.log("results media", results?.media?.metadata);
      //!! Fix the Typing for this.  Coming from the Clean Book function
      //!! Not really used elsewhere, look at how it is used in other parts
      //!! Maybe create specific type for this in types.ts
      externalMetadata = {
        audioSource: "abs",
        title: results.media.metadata?.title,
        author: results.media.metadata?.authorName,
        description: results.media.metadata?.description,
        genres: results.media.metadata?.genres.join(","),
        publishedYear: results.media.metadata?.publishedYear,
        narratedBy: results.media.metadata?.narratorName,
        ASIN: results.media.metadata?.asin,
      };
    }

    // Get picture colors if available
    if (tags.pictureURI && calculateColor) {
      const colors = (await getImageColors(
        resolveABSImage(tags.pictureURI)
      )) as PlaylistImageColors;
      tags.pictureColors = colors;
    }

    // ------------------------------------
    // -- GET LAAB Metadata if it exists -- NO LONGER GETTING CHAPTER INFO FROM THIS FILE
    // -- Getting it from the Event.MetadataChapterReceived event in trackPlayerUtils.ts
    let LAABMeta: LAABData = undefined;

    if (audioSource === "dropbox") {
      // LAABMeta = await laabMetaDropbox(sourceLocation, filename);
      externalMetadata = await getMetadataDropbox(sourceLocation, filename);
    } else if (audioSource === "google") {
      //! Google LaabMeta check This is the file with the chapters (We now do it in TrackPlayer)
      // const laabFileName = `${getCleanFileName(filename)}_laabmeta.json`;
      const laabData = undefined; // await getJsonData({ folderId: pathIn, filename: laabFileName });
      if (laabData) {
        LAABMeta = createLAABMeta(laabData);
      } else {
        LAABMeta = undefined;
      }
      //! Google book metadata object
      //! ISSUE:  The metafilename is based on the book FOLDER Name not the
      //!    filename.  Google uses IDs for the folder, need to have the metadata
      //!  FIX: pass the folder name in as currFolderText
      const metaFileName = `${sanitizeString(currFolderText.toLowerCase())}-metadata.json`;
      // Download metadata json file
      //!!
      const metaData = (await getJsonData({
        folderId: pathIn,
        filename: metaFileName,
      })) as BookJSONMetadata;
      // If found, clean it and add it to the final track object
      if (metaData) {
        externalMetadata = cleanOneBook(metaData, pathIn, "dropbox");
        externalMetadata.audioSource = "google";
        externalMetadata.fullPath = `${pathIn}`;
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
    const newAudioFile: AudioTrack = {
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
    if (externalMetadata) {
      newAudioFile.externalMetadata = {
        dateDownloaded: format(new Date(), "MM/dd/yyyy"),
        ...externalMetadata,
      };
    }
    // Right now we do NOT allow any duplicate files (dir/filename)
    // remove the file ONLY FROM STORE if it exists.  By the time we are in the store
    // it has already been saved and that is fine.
    const filteredList = get().tracks.filter((el) => el.id !== id);

    // Add the new track to current track list
    const newAudioFileList = [...filteredList, newAudioFile];
    set({ tracks: newAudioFileList });

    // //!! ---------
    try {
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
      //
      if (!tags?.chapters || tags?.chapters?.length === 0) {
        const trackPlayerTrack = {
          id: `${filename}`,
          filename: `${filename}`,
          url: `${FileSystem.documentDirectory}${fileURI}`,
          duration: tags.durationSeconds,
        };
        await TrackPlayer.reset();
        await TrackPlayer.add([trackPlayerTrack]);
        await TrackPlayer.skip(0);
      }
      // console.log("Trackplayer Chapter Check END");
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
      const finalPlaylistId = get().actions.addNewPlaylist(
        plName,
        plAuthor,
        playlistId,
        audioSource
      );
      try {
        await get().actions.addTracksToPlaylist(finalPlaylistId, [newAudioFile.id]);

        await saveToAsyncStorage("tracks", newAudioFileList);
      } catch (e) {
        console.log("Error in addTrack (store-function) adding track to playlist", playlistId);
      }
      // console.log("addTrack store-functions", newAudioFile?.filename, finalPlaylistId);
    } finally {
      isCriticalSectionLocked = false;
      // If the audio source is abs, then get the user info and merge any abs server bookmarks
      if (audioSource === "abs") {
        const userInfo = await absGetUserInfo();
        get().actions.mergeABSBookmarks(userInfo.bookmarks);
      }
    }
    // console.log(`${filename}-ADD TRACK DONE`, Date.now());
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
      // console.log("Replacing Target", key, targetValue);
      target[key] = sourceValue;
    }
  }

  return target;
}

//~~ -------------------------------------
//~~ metaDataDropbox - Get metadata from Dropbox
//~~ -------------------------------------
// function sanitizeString(title: string) {
//   // In little ape audio this function is called "getCleanFileName"
//   return title
//     .replace(/^\s+|\s+$/g, "") // Remove leading and trailing spaces
//     .replace(/\s+/g, "~") // Replace spaces with '~'
//     .replace(/[^\w.~]+/g, "_") // Replace non-alphanumeric, non-period, non-underscore, non-tilde characters with '_'
//     .replace(/_$/, "") // Get rid of trailing _
//     .replace(/^_/, ""); // get rid of leading _
//   // return title.replace(/[^\w.]+/g, "_").replace(/_$/, "");
// }
const getMetadataDropbox = async (sourceLocation: string, filename: string) => {
  //~~ Check for metadata file
  const laabPath = sourceLocation.slice(0, sourceLocation.lastIndexOf("/"));
  // sourceLocation includes the full path plus the filename
  // laabPath has the filename stripped and does NOT have a trailing "/"
  // Now we need to get metadata filename, which will be the foldername sanitized, etc
  // We pull the foldername below
  const metadataFileName = `${sanitizeString(
    laabPath.substring(laabPath.lastIndexOf("/") + 1)
  )}-metadata.json`;
  const metadataFileNameWithPath = `${laabPath}/${metadataFileName}`;

  // laab meta file info will be loaded for use in player scroller so user can see description of book
  let convertedMeta: CleanBookMetadata = undefined;
  try {
    const metaData = (await downloadDropboxFile(`${metadataFileNameWithPath}`)) as BookJSONMetadata;
    convertedMeta = cleanOneBook(metaData, laabPath, "dropbox");
  } catch (err) {
    convertedMeta = undefined;
    console.log("Error in metaDataDropbox", err);
    // Assume the laab meta file was not found
    // console.log("Error in LAABMeta", err);
  }
  // console.log("convertedMeta", convertedMeta);
  return convertedMeta;
};

//~~ -------------------------------------
//~~ -------------------------------------
type ABSChapter = {
  id: number;
  title: string;
  start: number;
  end: number;
};

const absChapterConvert = (chapters: ABSChapter[]) => {
  if (!chapters || chapters.length === 0) return undefined;

  const newChapters = [];
  for (const chapter of chapters) {
    const chapterStart = Math.floor(chapter.start);
    const chapterEnd = Math.floor(chapter.end) - 1;
    newChapters.push({
      title: chapter.title,
      startSeconds: chapterStart,
      endSeconds: chapterEnd,
      durationSeconds: chapterEnd - chapterStart,
      startMilliSeconds: chapterStart * 1000,
      endMilliSeconds: chapterEnd * 1000,
      lengthMilliSeconds: (chapterEnd - chapterStart) * 1000,
    });
  }
  return newChapters;
};

//~~ ======================================
const laabMetaDropbox = async (sourceLocation: string, filename: string) => {
  //~~ Check for LAAB Meta file
  const laabPath = sourceLocation.slice(0, sourceLocation.lastIndexOf("/"));
  const laabFileName = `${getCleanFileName(filename)}_laabmeta.json`;
  const laabFileNameWithPath = `${laabPath}/${laabFileName}`;

  // const laabFileNameWithPath = `${laabPath}/${getCleanFileName(filename)}_laabmeta.json`;

  let LAABMeta: LAABData;
  // laab file contains chapter data sometimes
  let convertedMeta: CleanBookMetadata = undefined;
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
      chapt.startSeconds === undefined ||
      chapt.durationSeconds < 1
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
