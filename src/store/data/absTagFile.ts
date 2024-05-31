import { useTracksStore } from "@store/store";
import { AudioFile } from "./absTypes";
import { buildFilePathLower } from "./absUtils";

//~ -------------------------------
//~ Tag audiobookshelf Files as being already download
//~ -------------------------------
export const absTagFiles = (audioFiles: AudioFile[], bookId: string) => {
  const absFiles = audioFiles.map((audioFile) => ({
    ...audioFile,
    path_lower: buildFilePathLower(bookId, audioFile.ino),
  }));

  //!!! DEEP CLONING of object may be issue, we may be losing the nested objects
  const taggedFiles = absIsTrackDownloaded(absFiles);

  // Tag folders as being favorited

  return taggedFiles;
};

type AFPlus = AudioFile & { path_lower: string };
//-- Check to see if passed tracks have been downloaded, if so tag with isDownload
export const absIsTrackDownloaded = (tracksToCheck: AFPlus[]) => {
  const sourceArray = useTracksStore.getState().tracks.map((el) => el.sourceLocation);
  let taggedFiles = [];
  if (Array.isArray(tracksToCheck)) {
    for (const source of tracksToCheck) {
      const isDownloaded = sourceArray.includes(source.path_lower);
      taggedFiles.push({ ...source, alreadyDownload: isDownloaded });
    }
  }

  return taggedFiles as (AudioFile & { path_lower: string; alreadyDownload: boolean })[];
};
