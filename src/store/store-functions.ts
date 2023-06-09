import { SetState, StateCreator, StoreApi } from "zustand";
import { getAudioFileTags } from "../utils/audioUtils";
import { saveToAsyncStorage } from "./data/asyncStorage";
import { AudioState } from "./types";

type AddTrack = AudioState["actions"]["addNewTrack"];
type ZSetGet<T> = {
  set: (
    partial: T | Partial<T> | ((state: T) => T | Partial<T>),
    replace?: boolean
  ) => void;
  get: () => T;
};

export const addTrack =
  (
    set: ZSetGet<AudioState>["set"],
    get: ZSetGet<AudioState>["get"]
  ): AddTrack =>
  async (
    fileURI,
    filename,
    sourceLocation,
    playlistId = undefined,
    directory = ""
  ) => {
    // Get metadata for passed audio file
    const tags = await getAudioFileTags(fileURI);

    const id = `${directory}${filename}`;
    const newAudioFile = {
      id,
      fileURI,
      directory,
      filename,
      sourceLocation,
      metadata: { ...tags },
    };
    // If title is blank then use filename
    newAudioFile.metadata.title =
      newAudioFile.metadata?.title || newAudioFile.filename;
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
      newAudioFile.metadata?.album ||
      newAudioFile.metadata?.title ||
      newAudioFile.filename;
    const plAuthor = newAudioFile.metadata?.artist || "Unknown";
    const finalPlaylistId = await get().actions.addNewPlaylist(
      plName,
      plAuthor,
      playlistId
    );
    await get().actions.addTracksToPlaylist(finalPlaylistId, [newAudioFile.id]);

    await saveToAsyncStorage("tracks", newAudioFileList);
  };
