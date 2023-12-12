import {
  Playlist,
  AudioState,
  ApeTrack,
  Bookmark,
  TrackAttributes,
  AudioTrack,
  PlaylistImageColors,
} from "./types";
import { create } from "zustand";
import { Alert, Image } from "react-native";
import uuid from "react-native-uuid";
import {
  loadFromAsyncStorage,
  removeFromAsyncStorage,
  saveToAsyncStorage,
} from "./data/asyncStorage";
import { analyzePlaylistTracks } from "./storeUtils";
import sortBy from "lodash/sortBy";
import orderBy from "lodash/orderBy";
import map from "lodash/map";
import TrackPlayer, { Track, State, Event, PitchAlgorithm } from "react-native-track-player";
import { useEffect, useState } from "react";
import { Chapter, addTrack } from "./store-functions";
import { deleteFromFileSystem } from "./data/fileSystemAccess";
import { useDropboxStore } from "./store-dropbox";
import { useSettingStore } from "./store-settings";
import { defaultImages, getRandomNumber } from "./storeUtils";
import * as FileSystem from "expo-file-system";
import { getImageSize } from "@utils/audioUtils";

import { shallow } from "zustand/shallow";
import { router } from "expo-router";
import { formatSeconds } from "@utils/formatUtils";
import { getCurrentChapter } from "@utils/chapterUtils";
import { debounce, reverse } from "lodash";
import { getImageColors } from "@utils/otherUtils";
// export function getRandomNumber() {

//   const randomNumber = Math.floor(Math.random() * 13) + 1; // Generate random number between 1 and 13
//   return randomNumber.toString().padStart(2, "0"); // Pad number with leading zero if less than 10
// }

let eventPlayerTrackChange = undefined;
let eventEndOfQueue = undefined;
let eventPlayerStateChange = undefined;
let eventProgressUpdated = undefined;
let eventMetadataChapterReceived = undefined;
let saveIntervalId = undefined;
//-- ==================================
//-- TRACK STORE
//-- ==================================
export const useTracksStore = create<AudioState>((set, get) => ({
  tracks: [],
  playlists: {},
  playlistUpdated: new Date(),
  actions: {
    addNewTrack: addTrack(set, get),
    updateTrackMetadata: async (trackId, trackMetadata) => {
      const tracks = [...get().tracks];
      // Find the track to update
      const trackToUpdate = tracks.find((track) => track.id === trackId);
      const currTrackMetadata = trackToUpdate.metadata;
      // bail if no track found
      if (!trackToUpdate) return;
      const mergedTrack = {
        ...trackToUpdate,
        metadata: { ...currTrackMetadata, ...trackMetadata },
      };

      // Merge changes
      const newTracks = [...tracks.filter((track) => track.id !== trackId), mergedTrack];

      await saveToAsyncStorage("tracks", newTracks);
      set({ tracks: newTracks });
    },
    removeTracks: async (ids) => {
      // Use passed id to do the following:
      // - lookup audioFile information in audioFiles array
      // - delete the file from FileSystem storage
      // - remove the file information from the audioFiles Array
      //   creating a new array of audioFiles.  Save this new array
      //   to asyncStorage AND then update the AudioStore.audioFiles
      // track to delete
      // loop and delete each file from the system and return an array
      // of promises to remove from async storage
      let newTracks = get().tracks;
      const deletePromises = ids.map(async (id) => {
        // store trackToDelete's info
        const trackToDelete = get().tracks.find((el) => el.id === id);
        // Delete from store
        newTracks = newTracks.filter((el) => el.id !== id);
        // return a promise
        return await deleteFromFileSystem(
          `${FileSystem.documentDirectory}${trackToDelete?.fileURI}`
        );
      });
      await Promise.all(deletePromises);
      await saveToAsyncStorage("tracks", newTracks);

      set({ tracks: newTracks });
    },
    isTrackDownloaded: (tracksToCheck) => {
      const sourceArray = get().tracks.map((el) => el.sourceLocation);
      let taggedFiles = [];
      if (Array.isArray(tracksToCheck)) {
        for (const source of tracksToCheck) {
          const isDownloaded = sourceArray.includes(source.path_lower);
          taggedFiles.push({ ...source, alreadyDownload: isDownloaded });
        }
      }

      return taggedFiles;
    },
    addNewPlaylist: (name, author = "Unknown", playlistId) => {
      //!const playlists = [...get().playlists];
      // If playlist ID is passed, check to see if the playlist exists
      if (playlistId) {
        if (get().playlists[playlistId]) {
          return playlistId;
        }
        //! if (playlists.findIndex((el) => el.id === playlistId) !== -1) {
        //!   return playlistId;
        //! }
      }

      // the "name" passed will be the album of the track that is going to be added
      // Check all of the existing playlists to see if one has the same name
      // If so, then return that id otherwise create a new playlist and return that id
      //--Use lodash to convert obj into array of objects
      const playlists = map(get().playlists);
      for (const playlist of playlists) {
        if (playlist.name === name) {
          return playlist.id;
        }
      }
      // No existing playlist found, create a new one based either on
      // the passed in playlistId OR if not passed, create a new id
      const id = playlistId || (uuid.v4() as string);
      const newPlaylist: Playlist = {
        id,
        name,
        author,
        lastPlayedDateTime: Date.now(),
        overrideTrackImage: false,
        imageURI: undefined,
        imageAspectRatio: undefined,
        imageType: undefined,
        imageColors: undefined,
        positionHistory: undefined,
        trackAttributes: undefined,
        genre: undefined,
        totalDurationSeconds: 0,
        totalListenedToSeconds: 0,
        currentRate: 1,
      };

      const newPlaylistObj = { ...get().playlists, [id]: newPlaylist };
      set({ playlists: newPlaylistObj });
      // await saveToAsyncStorage("playlists", newPlaylistObj);
      return id;
    },
    addTracksToPlaylist: async (playlistId, tracks) => {
      const storedTracks = [...get().tracks];
      const playlist = get().playlists[playlistId];

      // Take the tracks being added and merge them with existing tracks
      // in playlist.  Get rid of dups.
      const uniqueTracksPlaylist = [...new Set([...tracks, ...(playlist.trackIds || [])])];

      const { images, genres, totalDuration } = analyzePlaylistTracks(
        storedTracks,
        uniqueTracksPlaylist
      );
      //-- Add Image to playlist
      // If no image found use a random local image for playlist
      if (images.length === 0) {
        const randomNum = getRandomNumber();
        const randomImageInfo = Image.resolveAssetSource(defaultImages[`image${randomNum}`]);
        const randomImageAspect = randomImageInfo.width / randomImageInfo.height;
        playlist.imageURI = randomImageInfo.uri;
        playlist.imageAspectRatio = randomImageAspect;
        // Getting the colors for the default image was causing issues  Think the async nature
        // was the problem.  Need to keep this function synchronous
        // const colors = (await getImageColors(playlist.imageURI)) as PlaylistImageColors;
        // playlist.imageColors = colors;
      } else {
        // There was an image, store the first one on the playlist
        playlist.imageURI = images[0].image;
        playlist.imageAspectRatio = images[0].aspectRatio;
        playlist.imageColors = images[0].imageColors;
      }
      // Image type is depricated because we are using the resolveAssetSource
      // to standardize local images
      // playlist.imageType = images[0] ? "uri" : "imported";
      //-- Add Image to playlist

      playlist.genre = genres[0];
      playlist.totalDurationSeconds = totalDuration;
      playlist.trackIds = sortBy(uniqueTracksPlaylist);

      // Update playlists in Store and Async Storage
      const playlists = { ...get().playlists, [playlistId]: playlist };

      set({ playlists });
      // set({ playlists, playlistUpdated: new Date() });
      await saveToAsyncStorage("playlists", playlists);
    },
    //! If removeAllTracks = false, then need to only delete tracks that only
    //! exist in this playlist.  i.e. need to check all other playlists OR
    //! Have a a playlist Id array in each track.
    removePlaylist: async (playlistId, removeAllTracks = true) => {
      const playlistToDelete = get().playlists[playlistId];

      // Check to see if tracks exist in other playlists
      // if count > 1 then don't delete from the system
      const trackCounts = trackCount(get().playlists);
      const tracksToDelete = playlistToDelete.trackIds
        .map((trackId) => {
          if (trackCounts[trackId] <= 1) {
            return trackId;
          }
        })
        .filter((el) => el);

      if (removeAllTracks && tracksToDelete) {
        // const x = await get().actions.removeTracks(playlistToDelete.trackIds);
        const x = await get().actions.removeTracks(tracksToDelete);
      }
      const updatedPlayList = get().playlists;
      delete updatedPlayList[playlistId];
      // const updatedPlayList = get().playlists.filter(
      //   (el) => el.id !== playlistId
      // );
      set({ playlists: updatedPlayList });
      await saveToAsyncStorage("playlists", updatedPlayList);
    },
    getPlaylist: (playlistId) => {
      return get().playlists[playlistId];
    },
    getTrack: (trackId) => {
      return get().tracks.find((el) => el.id === trackId);
    },
    clearAll: async () => {
      set({ tracks: [], playlists: {} });
      await removeFromAsyncStorage("tracks");
      await removeFromAsyncStorage("playlists");
    },
    updatePlaylistRate: (playlistId, newRate) => {
      const playlists = { ...get().playlists };
      playlists[playlistId].currentRate = newRate;
      set({ playlists });
      saveToAsyncStorage("playlists", playlists);
    },
    updatePlaylistFields: async (playlistId, updateObj) => {
      const {
        name,
        author,
        lastPlayedDateTime,
        overrideTrackImage,
        imageType,
        imageURI,
        imageAspectRatio,
        imageColors,
      } = updateObj;

      const playlists = { ...get().playlists };
      // lastPlayedDateTime processing
      if (lastPlayedDateTime && !isNaN(lastPlayedDateTime)) {
        playlists[playlistId].lastPlayedDateTime = lastPlayedDateTime;
      }

      // name processing
      if (name) {
        playlists[playlistId].name = name;
      }
      if (author) {
        playlists[playlistId].author = author;
      }

      // Image Processing
      let newPlaylists = {};
      if (imageURI) {
        let aspectRatio = imageAspectRatio;

        // If the aspectRatio was passed use it instead of calculating it
        if (!imageAspectRatio) {
          const { aspectRatio: aspectCalced } = await getImageSize(imageURI);
          aspectRatio = aspectCalced;
        }
        // Only process if we get a valid aspectRatio
        if (!isNaN(aspectRatio)) {
          playlists[playlistId].imageAspectRatio = aspectRatio;
          playlists[playlistId].imageURI = imageURI;
        }
      }
      if (imageColors) {
        playlists[playlistId].imageColors = imageColors;
      }
      if (overrideTrackImage !== undefined) {
        playlists[playlistId].overrideTrackImage = overrideTrackImage;
      }
      set({ playlists, playlistUpdated: new Date() });
      await saveToAsyncStorage("playlists", playlists);
    },
    updatePlaylistTracks: async (playlistId, newTracksArray) => {
      const playlists = { ...get().playlists };
      playlists[playlistId].trackIds = newTracksArray;
      // When tracks are updated RESET position of playlist
      playlists[playlistId].currentPosition = {
        position: 0,
        trackIndex: 0,
      };
      // set({ playlists });
      set({ playlists, playlistUpdated: new Date() });
      await saveToAsyncStorage("playlists", playlists);
    },
    deleteTrackFromPlaylist: async (playlistId, trackToDeleteId, shouldRemoveFile = true) => {
      const playlists = { ...get().playlists };
      const updatedTracks = playlists[playlistId].trackIds.filter(
        (trackId) => trackId !== trackToDeleteId
      );

      // Remove track from device
      if (shouldRemoveFile) {
        await get().actions.removeTracks([trackToDeleteId]);
      }

      // If we have removed the final track from a playlist, delete it?
      if (updatedTracks.length > 0) {
        playlists[playlistId].trackIds = updatedTracks;
        // set({ playlists });
        set({ playlists, playlistUpdated: new Date() });
        await saveToAsyncStorage("playlists", playlists);
        return playlistId;
      } else {
        // remove the playlist, but DON'T remove the track from the device
        await get().actions.removePlaylist(playlistId, false);
        // await usePlaybackStore().actions.resetPlaybackStore();
        return undefined;
      }
    },
    getPlaylistTracks: (playlistId) => {
      const playlist = get().actions.getPlaylist(playlistId);
      const trackIds = [...playlist.trackIds];
      let trackArray = [];
      for (const trackId of trackIds) {
        const track = get().actions.getTrack(trackId);
        trackArray.push(track);
      }
      return trackArray;
    },
    updatePlaylistPostionHistory: async (playlistId, position, trackIndex) => {
      const playlists = useTracksStore.getState().playlists;
      let newPosition = position;
      if (!position) {
        const { position: tpPosition } = await TrackPlayer.getProgress();
        newPosition = tpPosition;
      }
      playlists[playlistId].positionHistory = [
        { trackIndex, position: newPosition },
        ...(playlists[playlistId].positionHistory || []),
      ];
      set({ playlists });
      await saveToAsyncStorage("playlists", playlists);
    },
    addBookmarkToPlaylist: async (bookmarkName, playlistId, trackId, positionSeconds) => {
      const playlists = { ...get().playlists };
      const playlist = playlists[playlistId];
      const bookmarks = playlist?.bookmarks || [];
      const newBookmark = {
        id: uuid.v4(),
        name: bookmarkName,
        trackId,
        positionSeconds,
      } as Bookmark;
      const newBookmarks = [...bookmarks, newBookmark];
      playlist.bookmarks = newBookmarks;
      // set({ playlists });
      saveToAsyncStorage("playlists", playlists);
    },
    deleteBookmarkFromPlaylist: async (playlistId, bookmarkId) => {
      const playlists = { ...get().playlists };
      const playlist = playlists[playlistId];
      const bookmarks = playlist?.bookmarks;

      playlist.bookmarks = bookmarks.filter((el) => el.id !== bookmarkId);
      playlist.bookmarks = playlist.bookmarks.length === 0 ? undefined : playlist.bookmarks;
      set({ playlists });
      saveToAsyncStorage("playlists", playlists);
    },
    getBookmarksForPlaylist: (playlistId) => {
      const playlist = get().actions.getPlaylist(playlistId);
      return playlist?.bookmarks;
    },
  },
}));

export const useTrackActions = () => useTracksStore((state) => state.actions);
export const usePlaylists = () =>
  useTracksStore((state) => orderBy(map(state.playlists), ["lastPlayedDateTime"], ["desc"]));
//!! NEED TO Make sure to update playlistUpdated whenever a change is made to
//!! playlist that we want to track state changes.
export const useCurrentPlaylist = () => {
  const dateUpdated = useTracksStore((state) => state.playlistUpdated);
  const actions = useTrackActions();

  const currPlaylistId = usePlaybackStore.getState().currentPlaylistId;
  const [currPlaylist, setCurrentPlaylist] = useState<Playlist>();
  useEffect(() => {
    const playlist = actions.getPlaylist(currPlaylistId);
    setCurrentPlaylist(playlist);
  }, [dateUpdated]);

  return currPlaylist;
};
//-- ==================================
//-- PLAYBACK STORE
//-- ==================================

type PlaybackState = {
  currentPlaylistId: string;
  // currentPlaylist: Playlist;
  trackPlayerQueue: ApeTrack[];
  currentTrack: ApeTrack;
  currentTrackIndex: number;
  playerState: State;
  playlistLoaded: boolean;
  // Seconds into current track that is playing
  currentTrackPosition: number;
  // This is the total of all track durations in queue UP TO,
  //  but NOT including the current track
  currentQueuePosition: number;
  currentChapterInfo: Pick<Chapter, "title" | "startSeconds" | "endSeconds">;
  currentChapterIndex: number;
  // Number of seconds of previous chapters.  if three chapters and on third, then
  // this is the time of the first two chapters
  chapterProgressOffset: number;
  // true indicates another chapter in track after chapter indicated by currentChapterIndex
  nextChapterExists: boolean;
  currentRate: number;
  didUpdate: string;
  actions: {
    // New playlist being loaded
    setCurrentPlaylist: (playlistId: string, forceReload?: boolean) => Promise<void>;
    resetPlaybackStore: () => Promise<void>;
    getCurrentPlaylist: () => Playlist;
    play: () => Promise<void>;
    pause: () => Promise<void>;
    next: () => Promise<void>;
    prev: () => Promise<void>;
    jumpForward: (jumpForward: number) => Promise<void>;
    jumpBack: (jumpBack: number) => Promise<void>;
    seekTo: (position: number) => Promise<void>;
    goToTrack: (trackIndex: number) => Promise<void>;
    // Updates the speed (rate) of the audio
    updatePlaybackRate: (newRate: number) => Promise<void>;
    updatePlaylistTracks: (playlistId: string, trackIdArray: string[]) => Promise<void>;
    removePlaylistTrack: (playlistId: string, trackIdToDelete: string) => Promise<void>;
    getPrevTrackDuration: () => number;
    setCurrentTrackPosition: (positionSeconds: number) => void;
    getCurrentTrackPosition: () => number;
    addBookmark: (bookmarkName: string, currPos?: number) => void;
    deleteBookmark: (bookmarkId: string) => void;
    getBookmarks: () => Bookmark[];
    applyBookmark: (bookmarkId: string) => Promise<void>;
  };
};

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  currentPlaylistId: undefined,
  // currentPlaylist: undefined,
  trackPlayerQueue: undefined,
  currentTrack: undefined,
  currentTrackIndex: 0,
  currentTrackPosition: 0,
  currentQueuePosition: 0,
  currentChapterInfo: undefined,
  currentChapterIndex: 0,
  chapterProgressOffset: 0,
  nextChapterExists: false,
  playerState: undefined,
  playlistLoaded: false,
  currentRate: 1,
  didUpdate: "init",
  actions: {
    resetPlaybackStore: async () => {
      set({
        currentPlaylistId: undefined,
        // currentPlaylist: undefined,
        trackPlayerQueue: undefined,
        currentTrack: undefined,
        currentChapterInfo: undefined,
        currentChapterIndex: 0,
        currentTrackIndex: 0,
        currentTrackPosition: 0,
        currentQueuePosition: 0,
        currentRate: 1,
        playerState: undefined,
        playlistLoaded: false,
      });
      unmountTrackListeners();
      TrackPlayer.reset();
    },
    setCurrentPlaylist: async (playlistId, forceReload = false) => {
      set({ playlistLoaded: false });

      await useTracksStore.getState().actions.updatePlaylistFields(playlistId, {
        lastPlayedDateTime: Date.now(),
      });
      if (get().currentPlaylistId === playlistId && !forceReload) {
        set({ playlistLoaded: true });
        return;
      }

      //----------
      // Pause the player before loading the new track.  Even though
      // store existing playlist information in TrackStore -> playlists
      // before loading new playlist
      await saveCurrentTrackInfo();
      await TrackPlayer.pause();
      await get().actions.resetPlaybackStore();

      // await TrackPlayer.reset();
      //---------
      // Load new Playlist
      const currPlaylist = useTracksStore.getState().actions.getPlaylist(playlistId);

      //!
      const queue = buildTrackPlayerQueue(currPlaylist.trackIds);

      set({
        currentPlaylistId: playlistId,
        // currentPlaylist: currPlaylist,
        trackPlayerQueue: queue,
      });

      const currTrackIndex = currPlaylist.currentPosition?.trackIndex || 0;
      const currTrackPosition = currPlaylist.currentPosition?.position || 0;
      // console.log("setCurrPL", currTrackIndex, currTrackPosition);
      // Call function to get current chapter Info

      const { chapterInfo, chapterIndex, chapterProgressOffset, nextChapterExists } =
        getCurrentChapter({
          chapters: queue[currTrackIndex]?.chapters,
          position: currTrackPosition,
        });

      set({
        currentTrack: queue[currTrackIndex],
        currentTrackIndex: currTrackIndex,
        currentTrackPosition: currTrackPosition,
        currentChapterInfo: chapterInfo,
        currentChapterIndex: chapterIndex,
        currentRate: currPlaylist.currentRate,
        chapterProgressOffset,
        nextChapterExists,
      });

      // when a track changes, set the currentQueuePosition.  This is the total of all
      // track durations in queue UP TO, but NOT including the current track
      const prevTracksDuration = usePlaybackStore.getState().actions.getPrevTrackDuration();
      // usePlaybackStore.setState({ currentQueuePosition: prevTracksDuration });
      set({ currentQueuePosition: prevTracksDuration });
      set({ playlistLoaded: true });
      // - Reset TrackPlayer and add the Queue
      await TrackPlayer.add(queue);
      // - Make sure current track is loaded and set to proper position
      await TrackPlayer.skip(currTrackIndex);
      //!
      await TrackPlayer.seekTo(currTrackPosition);
      await TrackPlayer.setRate(currPlaylist.currentRate);
      // await new Promise((resolve) => setTimeout(resolve, 100));

      if (!currPlaylist?.imageColors) {
        const colors = (await getImageColors(currPlaylist.imageURI)) as PlaylistImageColors;
        useTracksStore.getState().actions.updatePlaylistFields(playlistId, { imageColors: colors });
        set({ didUpdate: uuid.v4().toString() });
      }
      mountTrackPlayerListeners();
      set({ playlistLoaded: true });
    },
    getCurrentPlaylist: () => {
      const plId = get().currentPlaylistId;
      return useTracksStore.getState().actions.getPlaylist(plId);
    },
    updatePlaybackRate: async (newRate) => {
      if (isNaN(newRate)) return;
      const currPlaylistId = get().currentPlaylistId;
      if (newRate > 0 && newRate <= 5) {
        // Update rate on playlist in trackStore
        useTracksStore.getState().actions.updatePlaylistRate(currPlaylistId, newRate);
        // ALSO update the playlist in the playbackStore (currentPlaylist)
        // const currPlaylist = { ...get().currentPlaylist };
        // currPlaylist.currentRate = newRate;
        // set({ currentPlaylist: currPlaylist });
        await TrackPlayer.setRate(newRate);
        set({ currentRate: newRate, didUpdate: uuid.v4().toString() });
      }
    },
    updatePlaylistTracks: async (playlistId, trackIdArray) => {
      // This is called when the order of tracks has changed
      // or when a tracks have been moved or deleted.
      // Since we have controls mounted, we need to make sure those
      // components don't try to load anything till we are done.
      set({ playlistLoaded: false });

      // 1. Update Track Store's playlist with new track ids/order
      await useTracksStore.getState().actions.updatePlaylistTracks(playlistId, trackIdArray);

      // 2. Rebuild current playlistId queue and update playback Object
      const queue = buildTrackPlayerQueue(trackIdArray);
      // start object that will update PlaybackStore's keys
      let updatePlayerObj: Partial<Omit<PlaybackState, "actions">> = {
        trackPlayerQueue: queue,
      };
      // 3. Reset queue to first track position zero
      updatePlayerObj.currentTrackIndex = 0;
      updatePlayerObj.currentTrack = queue[0];
      updatePlayerObj.currentTrackPosition = 0;
      updatePlayerObj.currentQueuePosition = 0;
      //Update PlaybackStore
      set({
        ...updatePlayerObj,
      });

      // When tracks are reordered the currentQueue pos will be messed up.
      // This is the total of all
      // track durations in queue UP TO, but NOT including the current track

      const prevTracksDuration = usePlaybackStore.getState().actions.getPrevTrackDuration();
      // NOT sure why, but when I didn't merge state it cleared the other state values
      usePlaybackStore.setState((state) => ({
        ...state,
        currentQueuePosition: prevTracksDuration,
      }));

      // - Make sure current track is loaded and set to proper position
      await TrackPlayer.reset();
      await TrackPlayer.add(queue);
      console.log("skip num", get().currentTrackIndex);
      await TrackPlayer.skip(get().currentTrackIndex);
      await TrackPlayer.seekTo(get().currentTrackPosition);
      await TrackPlayer.setRate(getCurrentPlaylist().currentRate);
      mountTrackPlayerListeners();

      set({ playlistLoaded: true });
    },
    removePlaylistTrack: async (playlistId, trackIdToDelete) => {
      set({ playlistLoaded: false });
      const playlistTrackIds = useTracksStore.getState().playlists[playlistId].trackIds;

      // ~~ Function to be called from Alert if One track left and playlist is to be deleted
      const deletePlaylistRoute = async () => {
        set({ playlistLoaded: false });
        // console.log("NAV TO ROUTE");
        router.replace("/audio");
        await useTracksStore.getState().actions.removePlaylist(playlistId);
        get().actions.resetPlaybackStore();
      };
      // Check if only one track in playlist, if so, we are deleting
      // the last track.  Delete the whole playlist
      if (playlistTrackIds.length === 1) {
        Alert.alert(
          "Delete Playlist",
          "This is the last track in the playlist.  If you delete it, the playlist will also be deleted.",
          [{ text: "Ok", onPress: deletePlaylistRoute }, { text: "Cancel" }]
        );
      } else {
        const newTrackIds = playlistTrackIds.filter((trackId) => trackId !== trackIdToDelete);
        await useTracksStore
          .getState()
          .actions.deleteTrackFromPlaylist(playlistId, trackIdToDelete);
        await get().actions.updatePlaylistTracks(playlistId, newTrackIds);
      }
      set({ playlistLoaded: true });
    },
    setCurrentTrackPosition: (positionsSeconds) => {
      set({ currentTrackPosition: positionsSeconds });
    },
    getCurrentTrackPosition: () => {
      return get().currentTrackPosition;
    },
    addBookmark: (bookmarkName = "Unknown", currPos) => {
      const currPlaylistId = get().currentPlaylistId;
      const currTrack = get().currentTrack;
      const currPosition = currPos || get().currentTrackPosition;
      useTracksStore
        .getState()
        .actions.addBookmarkToPlaylist(bookmarkName, currPlaylistId, currTrack.id, currPosition);
      set({ didUpdate: uuid.v4().toString() });
    },
    deleteBookmark: async (bookmarkId) => {
      const currPlaylistId = get().currentPlaylistId;

      await useTracksStore
        .getState()
        .actions.deleteBookmarkFromPlaylist(currPlaylistId, bookmarkId);
      set({ didUpdate: uuid.v4().toString() });
    },
    getBookmarks: () => {
      const currPlaylistId = get().currentPlaylistId;
      const bookmarks = useTracksStore.getState().actions.getBookmarksForPlaylist(currPlaylistId);
      return bookmarks;
    },
    applyBookmark: async (bookmarkId) => {
      const bookmarks = get().actions.getBookmarks();
      const { positionSeconds, trackId } = bookmarks.find((el) => el.id === bookmarkId);
      const trackQ = get().trackPlayerQueue;
      const trackIndex = trackQ.findIndex((el) => el.id === trackId);
      await TrackPlayer.skip(trackIndex);
      await get().actions.seekTo(positionSeconds);
    },
    getPrevTrackDuration: () => {
      // used is calculating progress acroos all tracks in playlist
      const queue = get().trackPlayerQueue;
      let final = 0;
      let index = 0;

      for (let el of queue) {
        if (index >= get().currentTrackIndex) {
          break;
        }
        // console.log("getPrev", index, get().currentTrackIndex, final, el.duration);
        final += el.duration;
        index++;
      }

      return final;
      // return queue.reduce((final, el, index) => {
      //   if (index < get().currentTrackIndex) {
      //     console.log("getPrev", index, get().currentTrackIndex, final, el.duration);
      //     final = final + el.duration;
      //   }
      //   return final;

      // }, 0);
    },
    play: async () => {
      await TrackPlayer.play();
    },
    pause: async () => {
      await TrackPlayer.pause();
    },
    next: async () => {
      const trackIndex = await TrackPlayer.getActiveTrackIndex();
      const queue = await TrackPlayer.getQueue();
      const { currentTrack, currentChapterIndex } = get();
      // Need to determine if we are moving to the next track or the next chapter
      // the Queue has tracks in it and each track may or may NOT have chapters.
      let moveToAction = "track";
      let nextChapter = {} as Chapter;

      if (currentTrack?.chapters?.length > 0) {
        if (currentTrack?.chapters?.length - 1 !== currentChapterIndex) {
          moveToAction = "chapter";
          nextChapter = currentTrack.chapters[currentChapterIndex + 1];
        }
      }
      // console.log("NEXT Chapt", nextChapter);
      // console.log("movetoaction", moveToAction, currentTrack?.chapters?.length, currentChapterIndex);
      if (moveToAction === "chapter") {
        await TrackPlayer.seekTo(nextChapter.startSeconds);
        return;
      }
      if (queue.length - 1 === trackIndex) {
        await TrackPlayer.skip(0);
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.skipToNext();
      }
      // console.log("chapt", chapt, chaptIndex, currTrack?.chapters);
    },
    prev: async () => {
      const trackIndex = await TrackPlayer.getActiveTrackIndex();
      const queue = await TrackPlayer.getQueue();
      const { currentTrack, currentChapterIndex } = get();
      // Need to determine if we are moving to the next track or the next chapter
      // the Queue has tracks in it and each track may or may NOT have chapters.
      let moveToAction = "track";
      let prevChapter = {} as Chapter;

      if (currentTrack?.chapters?.length > 0) {
        if (currentChapterIndex !== 0) {
          moveToAction = "chapter";
          prevChapter = currentTrack.chapters[currentChapterIndex - 1];
        }
      }
      // console.log("PREV Chapt", prevChapter);
      // console.log(
      //   "movetoaction",
      //   moveToAction,
      //   currentTrack?.chapters?.length,
      //   currentChapterIndex
      // );
      if (moveToAction === "chapter") {
        await TrackPlayer.seekTo(prevChapter.startSeconds);
        return;
      }

      if (trackIndex === 0) {
        await TrackPlayer.seekTo(0);
      } else {
        await TrackPlayer.skipToPrevious();
      }
    },
    jumpForward: async (jumpForwardSeconds: number) => {
      const { position: currPos, duration: currDuration } = await TrackPlayer.getProgress();
      // const currDuration = await TrackPlayer.getDuration();
      const trackIndex = await TrackPlayer.getActiveTrackIndex();
      const qLength = get().trackPlayerQueue.length;
      const newPos = currPos + jumpForwardSeconds;
      if (newPos > currDuration) {
        // go to next track.   calculate how much "seekTo" is in
        // currtrack and how much in next track.
        // currPos = 25 currDuration = 30, seekTo = 10
        // We go to next track and start 5 seconds in next track
        await get().actions.next();

        if (trackIndex !== qLength - 1) {
          await TrackPlayer.seekTo(jumpForwardSeconds - (currDuration - currPos));
        }
      } else {
        await TrackPlayer.seekTo(newPos);
      }
    },
    jumpBack: async (jumpBackSeconds: number) => {
      const { position: currPos } = await TrackPlayer.getProgress();
      const newPos = currPos - jumpBackSeconds;
      if (newPos < 0) {
        // go to prev track.  You could get crazy and calculate how much "seekBack" is in
        // currtrack and how much in prev track.
        // currPos = 25 currDuration = 30, seekTo = 10
        // We go to prev track and start 5 seconds in prev track
        //!  IMPLEMENTED Below
        const trackIndex = await TrackPlayer.getActiveTrackIndex();
        await get().actions.prev();
        if (trackIndex !== 0) {
          const { duration } = await TrackPlayer.getProgress();
          await TrackPlayer.seekTo(duration + newPos);
        }
      } else {
        await TrackPlayer.seekTo(newPos);
      }
    },
    seekTo: async (position) => {
      await TrackPlayer.seekTo(position);
      await saveCurrentTrackInfo();
    },
    goToTrack: async (trackIndex) => {
      await TrackPlayer.skip(trackIndex);
      await saveCurrentTrackInfo();
    },
  },
}));

export const getCurrentPlaylist = () => {
  const plId = usePlaybackStore.getState().currentPlaylistId;
  return useTracksStore.getState().actions.getPlaylist(plId);
};
//! - This gets the current queue in TrackPlayer
//! - BUT, we also store this in the PlaybackStore in currentQueue
//!! - NOT SURE IF WE NEED THIS
export const useGetQueue = () => {
  const [tracks, setTracks] = useState<Track[]>();

  useEffect(() => {
    const getQueue = async () => {
      const tracks = await TrackPlayer.getQueue();
      setTracks(tracks);
    };
    getQueue();
  }, []);

  return tracks;
};

const buildTrackPlayerQueue = (trackIds: string[]): ApeTrack[] => {
  const trackActions = useTracksStore.getState().actions;
  let queue = [];
  for (const trackId of trackIds) {
    const trackInfo = trackActions.getTrack(trackId);
    // Make sure we found a track
    if (!trackInfo?.id) {
      alert(`Could Not find Track ${trackInfo.id}...skipping`);
      continue;
    }
    const trackPlayerTrack = {
      id: trackInfo.id,
      filename: trackInfo.filename,
      url: `${FileSystem.documentDirectory}${trackInfo.fileURI}`,
      title: trackInfo.metadata.title,
      artist: trackInfo.metadata.artist,
      album: trackInfo.metadata.album,
      genre: trackInfo.metadata.album,
      trackNum: trackInfo.metadata.trackNum,
      artwork: trackInfo.metadata.pictureURI,
      duration: trackInfo.metadata.durationSeconds,
      chapters: trackInfo.metadata.chapters,
      pitchAlgorithm: PitchAlgorithm.Voice,
    };
    queue.push(trackPlayerTrack);
  }
  return queue;
};

//~ ------------------------------------
//~ HELPERS
//~ ------------------------------------

/**
 * saveCurrentTrackInfo
 * Inquires the TrackPlayer to get the current track and position
 * then updates the playlist that is being played with this
 * information AND stores to asyncStorage "playlists".
 *
 */
// Debounce the saving function so that we don't get multiple saves if not needed.
const saveCurrentTrackInfo = debounce(async () => await saveCurrentTrackInfoBase(), 500);
const saveCurrentTrackInfoBase = async () => {
  const trackIndex = await TrackPlayer.getActiveTrackIndex();
  if (trackIndex !== null && trackIndex !== undefined) {
    //! Instead of polling TrackPlayer for position, get it from PlaybackStore
    //! We are updating this field every second in the PlaybackProgressUpdate listener
    const { position } = await TrackPlayer.getProgress(); // usePlaybackStore.getState().currentTrackPosition;

    const playlist = {
      ...useTracksStore.getState().playlists[usePlaybackStore.getState().currentPlaylistId],
    };

    //! Only store different value  NOTE: Had issues because needed to deal with NULL positionHistory
    const newPosCheck = `${trackIndex}-${Math.floor(position)}`;
    const lastPos = playlist?.positionHistory?.slice(0)[0] || {};
    const oldPosCheck = `${lastPos?.trackIndex}-${lastPos?.position}`;
    if (newPosCheck !== oldPosCheck) {
      playlist.positionHistory = [
        { trackIndex, position: Math.floor(position) },
        ...(playlist.positionHistory || []),
      ].slice(0, 15);
    }

    playlist.currentPosition = {
      trackIndex: trackIndex,
      position,
    };
    playlist.totalListenedToSeconds =
      usePlaybackStore.getState().actions.getPrevTrackDuration() + position;
    // Create update list of playlists
    const updatedPlaylists = {
      ...useTracksStore.getState().playlists,
      [playlist.id]: playlist,
    };
    useTracksStore.setState({ playlists: updatedPlaylists });
    await saveToAsyncStorage("playlists", updatedPlaylists);
  }
};

//~ ----------------------------------
//~ MOUNT/UNMOUNT TrackPlayer Event Listeners
//~ ----------------------------------
const unmountTrackListeners = () => {
  if (eventEndOfQueue) {
    eventEndOfQueue.remove();
  }
  if (eventPlayerTrackChange) {
    eventPlayerTrackChange.remove();
  }
  if (eventPlayerStateChange) {
    eventPlayerStateChange.remove();
  }
  if (eventProgressUpdated) {
    eventProgressUpdated.remove();
  }
  if (eventMetadataChapterReceived) {
    eventMetadataChapterReceived.remove();
  }
};

const mountTrackPlayerListeners = () => {
  // -- END OF QUEUE
  // if (eventEndOfQueue) {
  //   eventEndOfQueue.remove();
  // }
  //! Having some issue this event being called.  Don't know if it is really needed
  //! If it is, then will need to check "WHY" it is being called.  Seems to be called when going to "NEXT" or
  //! if on last queue track and go to previous track, it is called.
  //! I'm sure ways around it.  Check if current track is still last track, etc.
  if (eventEndOfQueue) {
    eventEndOfQueue.remove();
  }
  eventEndOfQueue = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async (event) => {
    // console.log("END OF QUEUE", event);
    const queue = await TrackPlayer.getQueue();
    if (queue.length > 1) {
      TrackPlayer.skip(0);
      TrackPlayer.pause();
    }
  });
  // ------------------------
  // -- TRACK CHANGED
  // ------------------------
  if (eventPlayerTrackChange) {
    eventPlayerTrackChange.remove();
  }
  eventPlayerTrackChange = TrackPlayer.addEventListener(
    Event.PlaybackActiveTrackChanged,
    async (event) => {
      // event = { "lastTrack", "lastIndex", "lastPosition", "index", "track"}
      // when reset is called you just get "lastTrack", "lastIndex", "lastPosition"
      // when new queue is loaded you just get "lastPosition", "index", "track" and
      //  the lastPosition will be zero.
      //~ ----
      // The only time we "use" this listener is when a track goes to the next track or previous
      // track.  This can happen when calling TrackPlayer.skip or usePlaybackStore action "next", "previous"
      // OR if a track ends and track player starts the next track.
      // There are two main purposes for this event
      //  - To keep the playlist object and playbackStore properties in sync with track changes
      //     position changes are kept up to date in the progress event
      //  - to set the position of the NEXT track based on information stored
      //     in the playlist?.trackAttributes object.
      //  -
      //~ ----

      // If there is no next track OR if we are in a loading state, just return
      if (event?.track === undefined || event?.lastIndex === undefined) return;
      //! This keeps this event from running if we are loading a new playlist
      if (!usePlaybackStore.getState().playlistLoaded) return;
      // ON TRACK CHANGE -
      // Get Next Track (if there is one) and update
      // PlaybackStore -> currentTrack, currentTrackIndex
      // TrackStore -> playlists object for current playlist
      //     update the playlists current position
      // =======================================
      // Get the event params
      const {
        index: nextTrackIndex,
        lastPosition: prevPositionSeconds,
        lastIndex: prevTrackIndex,
        // track,
      } = event;
      // console.log("Track Changed Event", prevTrackIndex, nextTrackIndex);

      const track = (await TrackPlayer.getTrack(nextTrackIndex)) as ApeTrack;
      // default is to look at saved position unless there was a previous track
      let naturalTrackChange = false;
      if (prevTrackIndex && !naturalTrackChange) {
        const prevTrack = (await TrackPlayer.getTrack(prevTrackIndex)) as ApeTrack;
        // Track has reached end of track (at least 1 second from end of track)
        // We take this to assume we are moving to the next track "naturally"
        // we will use this to start at the beginning of the next track instead of
        // looking at its set current position
        naturalTrackChange = Math.floor(prevTrack.duration - prevPositionSeconds) < 1;
      }

      // update playback store's info
      // used in track playback components track list, etc
      usePlaybackStore.setState({
        currentTrack: track,
        currentTrackIndex: nextTrackIndex,
      });

      // Get the current playlist object from the track store
      const playlist =
        useTracksStore.getState().playlists[usePlaybackStore.getState().currentPlaylistId];

      //~~START TrackAttributes
      //~~ Code to store and prevTracks position and restore "next" tracks position
      //~~ if one exists this exists on the playlist
      //! since we will only be in this code AFTER the playlist has loaded and the first track
      //! has been mounted, there will ALWAYS be a previous track.
      const prevTrackId = playlist.trackIds[prevTrackIndex];
      const nextTrackId = playlist.trackIds[nextTrackIndex];
      const prevTrackAtrributes = playlist?.trackAttributes?.[prevTrackId];
      const nextTrackAtrributes = playlist?.trackAttributes?.[nextTrackId];
      // console.log("PREV", prevTrackId, prevTrackAtrributes);
      // If it was a natural track change, then reset to zero
      // otherwise use the stored trackAttributes
      const nextTrackPosition = naturalTrackChange ? 0 : nextTrackAtrributes?.currentPosition ?? 0;

      playlist.currentPosition = {
        trackIndex: nextTrackIndex,
        position: nextTrackPosition,
      };

      // if no chapters then seek to next track position.  this allows the app to go to a the last position
      // the a given track was on (Need to have a flag to turn this off probably)
      if (!track?.chapters) {
        await TrackPlayer.seekTo(nextTrackPosition);
      } else {
        // If chapters then we need to clear the index.  keeps the track list from jumping to chapter 0
        // when initial move to the track is made i.e. before seek of the time.
        // usePlaybackStore.setState({ currentChapterIndex: undefined });
      }
      playlist.positionHistory = [
        { trackIndex: nextTrackIndex, position: nextTrackPosition },
        ...(playlist.positionHistory || []),
      ];
      // Update a copy of the trackattributes object, updating the prevTrackId's entry
      // We will RESET the prevTrack's position to zero IF we have reached the end of the track
      // naturalTrackChange = true will cause the reset to zero
      const newTrackAttributes = {
        ...playlist?.trackAttributes,
        [prevTrackId]: {
          ...prevTrackAtrributes,
          currentPosition: naturalTrackChange ? 0 : prevPositionSeconds,
        },
      };

      const uipdatedPlaylist = {
        ...playlist,
        trackAttributes: newTrackAttributes,
      };
      //~~END TrackAttributes

      const updatedPlaylists = {
        ...useTracksStore.getState().playlists,
        [playlist.id]: uipdatedPlaylist,
      };
      useTracksStore.setState({ playlists: updatedPlaylists });

      await saveToAsyncStorage("playlists", updatedPlaylists);
      // when a track changes, set the currentQueuePosition.  This is the total of all
      // track durations in queue UP TO, but NOT including the current track
      const prevTracksDuration =
        nextTrackIndex === 0 ? 0 : usePlaybackStore.getState().actions.getPrevTrackDuration();

      usePlaybackStore.setState({
        currentQueuePosition: prevTracksDuration,
      });
    }
  );
  //-- =================
  // -- STATE CHANGED
  //-- =================
  if (eventPlayerStateChange) {
    eventPlayerStateChange.remove();
  }
  eventPlayerStateChange = TrackPlayer.addEventListener(Event.PlaybackState, async (event) => {
    // console.log("STATE CHANGE", event);
    // Whenever state chagnes to Paused, then save the current position
    // on PlaybackStore AND TrackStore
    const { position } = await TrackPlayer.getProgress();
    //! NOTE: in trackPlayerUtils.ts, I setup another state change event listener
    //! its only job is to update teh playerState in the Playback Store
    //! I found some issues when the listeners were unmounted and state change happeneed not being recorded
    //!! Probably would be fine with one
    // usePlaybackStore.setState({ playerState: event.state });
    if (event.state === State.Stopped) {
      clearAutoSaveInterval(saveIntervalId);
    }
    if (event.state === State.Paused) {
      clearAutoSaveInterval(saveIntervalId);
      await saveCurrentTrackInfo();
      return;
    }
    if (event.state === State.Playing) {
      clearAutoSaveInterval(saveIntervalId);
      saveIntervalId = setInterval(async () => await saveCurrentTrackInfo(), 10000);
    }
  });
  //-- =================
  // -- PROGRESS UPDATES IN trackPlayerUtils.ts now
  //-- =================
  // if (eventProgressUpdated) {
  //   eventProgressUpdated.remove();
  // }
  // eventProgressUpdated = TrackPlayer.addEventListener(
  //   Event.PlaybackProgressUpdated,
  //   async (event) => {
  //     // Progress Updates {"buffered": 127.512, "duration": 127.512, "position": 17.216, "track": 0}
  //     // console.log("Progress Updates", event);
  //     //! Not sure if this is needed

  //     const position = Math.floor(event.position);
  //     usePlaybackStore.getState().actions.setCurrentTrackPosition(Math.floor(event.position));
  //     const queue = usePlaybackStore.getState().trackPlayerQueue;
  //     const trackIndex = usePlaybackStore.getState().currentTrackIndex;

  //     // console.log("Progress", position,  trackIndex);
  //     const { chapterInfo, chapterIndex } = getCurrentChapter({
  //       chapters: queue[trackIndex]?.chapters,
  //       position: position,
  //     });
  //     // console.log("chapter index", chapterIndex, position);
  //     usePlaybackStore.setState({
  //       currentChapterInfo: chapterInfo,
  //       currentChapterIndex: chapterIndex,
  //     });
  //     // console.log("Q", chapterInfo?.title, chapterIndex);
  //   }
  // );
};

function clearAutoSaveInterval(intervalId: number) {
  clearInterval(intervalId);
  intervalId = undefined;
}

//~~ -----------------------------------------
//~~ Counts how many playlists a track exists in
//~~ -----------------------------------------
function trackCount(playlists: Record<string, Playlist>) {
  const allTracks = Object.keys(playlists)
    .map((key) => {
      return playlists[key].trackIds;
    })
    .flatMap((el) => el);

  return allTracks.reduce((final, el) => {
    return { ...final, [el]: final?.[el] ? final?.[el] + 1 : 1 };
  }, {});
}
