import { Playlist, AudioState, ApeTrack } from "./types";
import { create } from "zustand";
import uuid from "react-native-uuid";
import {
  loadFromAsyncStorage,
  removeFromAsyncStorage,
  saveToAsyncStorage,
} from "./data/asyncStorage";
import { analyzePlaylistTracks } from "./storeUtils";
import sortBy from "lodash/sortBy";
import map from "lodash/map";
import TrackPlayer, {
  Track,
  State,
  Event,
  PitchAlgorithm,
} from "react-native-track-player";
import { useEffect, useState } from "react";
import { addTrack } from "./store-functions";
import { deleteFromFileSystem } from "./data/fileSystemAccess";
import { useDropboxStore } from "./store-dropbox";

export const image5 = require("../../assets/images/LittleApAudio05.png");
let eventPlayerTrackChange = undefined;
let eventEndOfQueue = undefined;
let eventPlayerStateChange = undefined;
let saveIntervalId = undefined;
//-- ==================================
//-- TRACK STORE
//-- ==================================
export const useTracksStore = create<AudioState>((set, get) => ({
  tracks: [],
  playlists: {},
  actions: {
    addNewTrack: addTrack(set, get),
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
        return await deleteFromFileSystem(trackToDelete?.fileURI);
      });
      await Promise.all(deletePromises);
      await saveToAsyncStorage("tracks", newTracks);
      set((state) => ({ ...state, tracks: newTracks }));
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
    addNewPlaylist: async (name, author = "Unknown", playlistId) => {
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
        imageURI: undefined,
        imageType: undefined,
        totalDurationSeconds: 0,
        currentRate: 1,
      };

      const newPlaylistObj = { ...get().playlists, [id]: newPlaylist };
      set({ playlists: newPlaylistObj });
      await saveToAsyncStorage("playlists", newPlaylistObj);
      return id;
    },
    addTracksToPlaylist: async (playlistId, tracks) => {
      const storedTracks = [...get().tracks];
      const playlist = get().playlists[playlistId];

      // console.log("ADD TRACK TO PL", playlistId, tracks);
      // Take the tracks being added and merge them with existing tracks
      // in playlist.  Get rid of dups.
      const uniqueTracksPlaylist = [
        ...new Set([...tracks, ...(playlist.trackIds || [])]),
      ];
      const { images, totalDuration } = analyzePlaylistTracks(
        storedTracks,
        uniqueTracksPlaylist
      );
      // console.log("IN STORE", image5);
      playlist.imageURI = images[0] || image5;
      playlist.imageType = images[0] ? "uri" : "imported";
      playlist.totalDurationSeconds = totalDuration;
      playlist.trackIds = sortBy(uniqueTracksPlaylist);

      // Update playlists in Store and Async Storage
      const playlists = { ...get().playlists, [playlistId]: playlist };
      set({ playlists });
      await saveToAsyncStorage("playlists", playlists);
    },
    //! If removeAllTracks = false, then need to only delete tracks that only
    //! exist in this playlist.  i.e. need to check all other playlists OR
    //! Have a a playlist Id array in each track.
    removePlaylist: async (playlistId, removeAllTracks = true) => {
      const playlistToDelete = get().playlists[playlistId];

      // const playlistToDelete = get().playlists.find(
      //   (el) => el.id === playlistId
      // );
      if (removeAllTracks && playlistToDelete?.trackIds) {
        const x = await get().actions.removeTracks(playlistToDelete.trackIds);
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
  },
}));

export const useTrackActions = () => useTracksStore((state) => state.actions);
export const usePlaylists = () =>
  useTracksStore((state) => map(state.playlists));
//-- ==================================
//-- PLAYBACK STORE
//-- ==================================
type PlaybackState = {
  currentPlaylistId: string;
  currentPlaylist: Playlist;
  trackPlayerQueue: ApeTrack[];
  currentTrack: ApeTrack;
  currentTrackIndex: number;
  playerState: State;
  currentTrackPosition: number;
  actions: {
    // New playlist being loaded
    setCurrentPlaylist: (playlistId: string) => Promise<void>;
    play: () => Promise<void>;
    pause: () => Promise<void>;
    next: () => Promise<void>;
    prev: () => Promise<void>;
    jumpForward: (jumpForward: number) => Promise<void>;
    jumpBack: (jumpBack: number) => Promise<void>;
    seekTo: (position: number) => Promise<void>;
    goToTrack: (trackIndex: number) => Promise<void>;
    updatePlaybackRate: (newRate: number) => Promise<void>;
  };
};
export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  currentPlaylistId: undefined,
  currentPlaylist: undefined,
  trackPlayerQueue: undefined,
  currentTrack: undefined,
  currentTrackIndex: 0,
  currentTrackPosition: 0,
  playerState: undefined,
  actions: {
    setCurrentPlaylist: async (playlistId) => {
      if (get().currentPlaylistId === playlistId) return;
      //----------
      // Store existing playlist information in TrackStore -> playlists
      // before loading new playlist
      await saveCurrentTrackInfo();
      //---------
      // Load new Playlist
      const currPlaylist = useTracksStore
        .getState()
        .actions.getPlaylist(playlistId);
      const queue = buildTrackPlayerQueue(currPlaylist.trackIds);
      set({
        currentPlaylistId: playlistId,
        currentPlaylist: currPlaylist,
        trackPlayerQueue: queue,
      });

      //!!
      const currTrackIndex = currPlaylist.currentPosition?.trackIndex || 0;
      const currTrackPosition = currPlaylist.currentPosition?.position || 0;
      set({
        currentTrack: queue[currTrackIndex],
        currentTrackIndex: currTrackIndex,
        currentTrackPosition: currTrackPosition,
      });
      // - Reset TrackPlayer and add the Queue
      await TrackPlayer.reset();
      await TrackPlayer.add(queue);
      // - Make sure current track is loaded and set to proper position
      await TrackPlayer.skip(currTrackIndex);
      await TrackPlayer.seekTo(currTrackPosition);
      await TrackPlayer.setRate(get().currentPlaylist.currentRate);

      mountTrackPlayerListeners();
    },
    updatePlaybackRate: async (newRate) => {
      if (isNaN(newRate)) return;
      const currPlaylistId = get().currentPlaylistId;
      if (newRate > 0 && newRate <= 5) {
        useTracksStore
          .getState()
          .actions.updatePlaylistRate(currPlaylistId, newRate);
        await TrackPlayer.setRate(newRate);
      }
    },
    play: async () => {
      await TrackPlayer.play();
    },
    pause: async () => {
      await TrackPlayer.pause();
    },
    next: async () => {
      const trackIndex = await TrackPlayer.getCurrentTrack();
      const queue = await TrackPlayer.getQueue();

      if (queue.length - 1 === trackIndex) {
        await TrackPlayer.skip(0);
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.skipToNext();
      }
    },
    prev: async () => {
      const trackIndex = await TrackPlayer.getCurrentTrack();
      if (trackIndex === 0) {
        await TrackPlayer.seekTo(0);
      } else {
        await TrackPlayer.skipToPrevious();
      }
    },
    jumpForward: async (jumpForwardSeconds: number) => {
      const currPos = await TrackPlayer.getPosition();
      const currDuration = await TrackPlayer.getDuration();
      const newPos = currPos + jumpForwardSeconds;
      if (newPos > currDuration) {
        // go to next track.  You could get crazy and calculate how much "seekTo" is in
        // currtrack and how much in next track.
        // currPos = 25 currDuration = 30, seekTo = 10
        // We go to next track and start 5 seconds in next track
        //!  Right now, just go to next track
        await get().actions.next();
      } else {
        await TrackPlayer.seekTo(newPos);
      }
    },
    jumpBack: async (jumpBackSeconds: number) => {
      const currPos = await TrackPlayer.getPosition();
      const newPos = currPos - jumpBackSeconds;
      if (newPos < 0) {
        // go to prev track.  You could get crazy and calculate how much "seekBack" is in
        // currtrack and how much in prev track.
        // currPos = 25 currDuration = 30, seekTo = 10
        // We go to prev track and start 5 seconds in prev track
        //!  Right now, just go to Prev track
        await get().actions.prev();
        const duration = await TrackPlayer.getDuration();
        await TrackPlayer.seekTo(duration + newPos);
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
    },
  },
}));

//! - This gets the current queue in TrackPlayer
//! - BUT, we also store this in the PlaybackStore in currentQueue
//!! - NOT SURE IF WE NEED THIS
export const useGetQueue = () => {
  const [tracks, setTracks] = useState<Track[]>();

  useEffect(() => {
    const getQueue = async () => {
      const tracks = await TrackPlayer.getQueue();
      const currTrack = await TrackPlayer.getCurrentTrack();
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
    const trackPlayerTrack = {
      id: trackInfo.id,
      filename: trackInfo.filename,
      url: trackInfo.fileURI,
      title: trackInfo.metadata.title,
      artist: trackInfo.metadata.artist,
      album: trackInfo.metadata.album,
      genre: trackInfo.metadata.album,
      artwork: trackInfo.metadata.pictureURI,
      duration: trackInfo.metadata.durationSeconds,
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
const saveCurrentTrackInfo = async () => {
  const trackIndex = await TrackPlayer.getCurrentTrack();
  if (trackIndex !== null && trackIndex !== undefined) {
    console.log("Saving Track Progress");
    const position = await TrackPlayer.getPosition();
    usePlaybackStore.setState({ currentTrackPosition: position });
    const playlist = {
      ...useTracksStore.getState().playlists[
        usePlaybackStore.getState().currentPlaylistId
      ],
    };
    playlist.currentPosition = {
      trackIndex: trackIndex,
      position,
    };
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
//~ ON INITIALIZE
//~ ----------------------------------
export const onInitialize = async () => {
  // await removeFromAsyncStorage("tracks");
  // await removeFromAsyncStorage("playlists");
  // await removeFromAsyncStorage("favfolders");
  const tracks = await loadFromAsyncStorage("tracks");
  const playlists = await loadFromAsyncStorage("playlists");
  const favFolders = await loadFromAsyncStorage("favfolders");

  useTracksStore.setState({ tracks: tracks || [], playlists: playlists || {} });

  useDropboxStore.setState({ favoriteFolders: favFolders });

  console.log(
    "store INIT # of Tracks",
    useTracksStore.getState().tracks.length
  );
  console.log(
    "store INIT Playlists",
    //useTracksStore.getState().playlists.length
    // map(`useTracksStore.getState().playlists`, "id"),
    // Object.keys(useTracksStore.getState().playlists)
    Object.keys(useTracksStore.getState().playlists).map(
      (key) => useTracksStore.getState().playlists[key].id
    )
    // usePlaylists().map((id) => `${id.id}-${id.name}`)
  );

  return;
};

//~ ----------------------------------
//~ MOUNT TrackPlayer Event Listeners
//~ ----------------------------------
const mountTrackPlayerListeners = () => {
  // -- METADATA
  // https://react-native-track-player.js.org/docs/api/events#playbackmetadatareceived
  // if (eventMetadata) {
  //   eventMetadata.remove();
  // }
  // eventMetadata = TrackPlayer.addEventListener(
  //   Event.PlaybackMetadataReceived,
  //   async (event) => {
  //     console.log("Metadata received", event);
  //   }
  // );
  // -- END OF QUEUE
  if (eventEndOfQueue) {
    eventEndOfQueue.remove();
  }
  eventEndOfQueue = TrackPlayer.addEventListener(
    Event.PlaybackQueueEnded,
    async (event) => {
      console.log("END OF QUEUE", event);
      const queue = await TrackPlayer.getQueue();
      if (queue.length > 1) {
        TrackPlayer.skip(0);
        TrackPlayer.pause();
      }
    }
  );

  // -- TRACK CHANGED
  if (eventPlayerTrackChange) {
    eventPlayerTrackChange.remove();
  }
  eventPlayerTrackChange = TrackPlayer.addEventListener(
    Event.PlaybackTrackChanged,
    async (event) => {
      console.log("TRACK CHANGE", event);
      // ON TRACK CHANGE -
      // Get Next Track (if there is one) and update
      // PlaybackStore -> currentTrack, currentTrackIndex
      // TrackStore -> playlists object for current playlist
      //     update the playlists current position
      if (event.nextTrack != null) {
        const track = await TrackPlayer.getTrack(event.nextTrack);
        usePlaybackStore.setState({
          currentTrack: track,
          currentTrackIndex: event.nextTrack,
        });
        const playlist =
          useTracksStore.getState().playlists[
            usePlaybackStore.getState().currentPlaylistId
          ];
        playlist.currentPosition = {
          trackIndex: event.nextTrack,
          position: 0,
        };
        const updatedPlaylists = {
          ...useTracksStore.getState().playlists,
          [playlist.id]: playlist,
        };
        useTracksStore.setState({ playlists: updatedPlaylists });
        await saveToAsyncStorage("playlists", updatedPlaylists);
      } else {
        TrackPlayer.seekTo(0);
        TrackPlayer.pause();
      }
    }
  );
  //-- =================
  // -- STATE CHANGED
  //-- =================
  if (eventPlayerStateChange) {
    eventPlayerStateChange.remove();
  }
  eventPlayerStateChange = TrackPlayer.addEventListener(
    Event.PlaybackState,
    async (event) => {
      console.log("STATE CHANGE", event, saveIntervalId);
      // Whenever state chagnes to Paused, then save teh current position
      // on PlaybackStore AND TrackStore
      usePlaybackStore.setState({ playerState: event.state });
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
        saveIntervalId = setInterval(async () => saveCurrentTrackInfo(), 10000);
        console.log("NEW Interval Id", saveIntervalId);
      }
    }
  );
};

function clearAutoSaveInterval(intervalId: number) {
  clearInterval(intervalId);
  intervalId = undefined;
}
