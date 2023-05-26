import { AudioTrack, AudioMetadata, Playlist, AudioState } from "./types";
import { create } from "zustand";
import uuid from "react-native-uuid";
import {
  loadFromAsyncStorage,
  removeFromAsyncStorage,
  saveToAsyncStorage,
} from "./data/asyncStorage";
import { getAudioFileTags } from "../utils/audioUtils";
import { analyzePlaylistTracks } from "./storeUtils";
import sortBy from "lodash/sortBy";
import TrackPlayer, { Track, State, Event } from "react-native-track-player";
import { useEffect, useState } from "react";
import { remove } from "lodash";

let eventIdOne;
let eventIdTwo;
//-- ==================================
//-- TRACK STORE
//-- ==================================
export const useTracksStore = create<AudioState>((set, get) => ({
  tracks: [],
  playlists: [],
  actions: {
    addNewTrack: async (
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
      await get().actions.addTracksToPlaylist(finalPlaylistId, [
        newAudioFile.id,
      ]);

      await saveToAsyncStorage("tracks", newAudioFileList);
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
      const playlists = [...get().playlists];
      // If playlist ID is passed, check to see if the playlist exists
      if (playlistId) {
        if (playlists.findIndex((el) => el.id === playlistId) !== -1) {
          return playlistId;
        }
      }

      // the "name" passed will be the album of the track that is going to be added
      // Check all of the existing playlists to see if one has the same name
      // If so, then return that id otherwise create a new playlist and return that id
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
        totalDurationSeconds: 0,
        currentRate: 1,
      };
      const newPlaylistArray = [newPlaylist, ...get().playlists];
      set({ playlists: newPlaylistArray });
      await saveToAsyncStorage("playlists", newPlaylistArray);
      return id;
    },
    addTracksToPlaylist: async (playlistId, tracks) => {
      const playlists = [...get().playlists];
      const storedTracks = [...get().tracks];

      // console.log("ADD TRACK TO PL", playlistId, tracks);
      for (let playlist of playlists) {
        if (playlist.id === playlistId) {
          // Take the tracks being added and merge them with existing tracks
          // in playlist.  Get rid of dups.
          const uniqueTracksPlaylist = [
            ...new Set([...tracks, ...(playlist.trackIds || [])]),
          ];
          const { images, totalDuration } = analyzePlaylistTracks(
            storedTracks,
            uniqueTracksPlaylist
          );
          playlist.imageURI = images[0];
          playlist.totalDurationSeconds = totalDuration;
          playlist.trackIds = sortBy(uniqueTracksPlaylist);
          // Once we find our playlist, exit
          break;
        }
      }
      // Update playlists in Store and Async Storage
      set({ playlists });
      await saveToAsyncStorage("playlists", playlists);
    },
    //! If removeAllTracks = false, then need to only delete tracks that only
    //! exist in this playlist.  i.e. need to check all other playlists OR
    //! Have a a playlist Id array in each track.
    removePlaylist: async (playlistId, removeAllTracks = true) => {
      const playlistToDelete = get().playlists.find(
        (el) => el.id === playlistId
      );
      if (removeAllTracks && playlistToDelete?.trackIds) {
        const x = await get().actions.removeTracks(playlistToDelete.trackIds);
      }
      const updatedPlayList = get().playlists.filter(
        (el) => el.id !== playlistId
      );
      set({ playlists: updatedPlayList });
      await await saveToAsyncStorage("playlists", updatedPlayList);
    },
    getPlaylist: (playlistId) => {
      return get().playlists.find((el) => el.id === playlistId);
    },
    getTrack: (trackId) => {
      return get().tracks.find((el) => el.id === trackId);
    },
    clearAll: async () => {
      set({ tracks: [], playlists: [] });
      await removeFromAsyncStorage("tracks");
      await removeFromAsyncStorage("playlists");
    },
  },
}));

export const useTrackActions = () => useTracksStore((state) => state.actions);

//-- ==================================
//-- PLAYBACK STORE
//-- ==================================
type PlaybackState = {
  currentPlaylistId: string;
  currentPlaylist: Playlist;
  trackPlayerQueue: Track[];
  currentTrack: Track;
  currentTrackIndex: number;
  currentTrackPosition: number;
  actions: {
    setCurrentPlaylist: (playlistId: string) => Promise<void>;
    play: () => Promise<void>;
    pause: () => Promise<void>;
    next: () => Promise<void>;
    prev: () => Promise<void>;
  };
};
export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  currentPlaylistId: undefined,
  currentPlaylist: undefined,
  trackPlayerQueue: undefined,
  currentTrack: undefined,
  currentTrackIndex: 0,
  currentTrackPosition: 0,
  actions: {
    setCurrentPlaylist: async (playlistId) => {
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

      if (eventIdOne) {
        eventIdOne.remove();
      }
      eventIdOne = TrackPlayer.addEventListener(
        Event.PlaybackTrackChanged,
        async (event) => {
          console.log("TRACK CHANGE", event);
          if (event.nextTrack != null) {
            const track = await TrackPlayer.getTrack(event.nextTrack);
            set({ currentTrack: track, currentTrackIndex: event.nextTrack });
            const playlists = useTracksStore.getState().playlists;
            for (let playlist of playlists) {
              if (playlist.id === get().currentPlaylistId) {
                playlist.currentPosition = {
                  trackIndex: event.nextTrack,
                  position: 0,
                };
              }
            }
            useTracksStore.setState({ playlists });
            await saveToAsyncStorage("playlists", playlists);
          }
        }
      );

      if (eventIdTwo) {
        eventIdTwo.remove();
      }
      eventIdTwo = TrackPlayer.addEventListener(
        Event.PlaybackState,
        async (event) => {
          console.log("STATE CHANGE", event);
          if (event.state === State.Paused) {
            const currPos = await TrackPlayer.getPosition();
            set({ currentTrackPosition: currPos });
            const playlists = useTracksStore.getState().playlists;
            for (let playlist of playlists) {
              if (playlist.id === get().currentPlaylistId) {
                playlist.currentPosition = {
                  trackIndex: get().currentTrackIndex,
                  position: currPos,
                };
              }
            }
            useTracksStore.setState({ playlists });
            await saveToAsyncStorage("playlists", playlists);
          }
        }
      );
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
      await TrackPlayer.skipToPrevious();
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
const buildTrackPlayerQueue = (trackIds: string[]) => {
  const trackActions = useTracksStore.getState().actions;
  let queue = [];
  for (const trackId of trackIds) {
    const trackInfo = trackActions.getTrack(trackId);
    const trackPlayerTrack = {
      url: trackInfo.fileURI,
      title: trackInfo.metadata.title,
      artist: trackInfo.metadata.artist,
      album: trackInfo.metadata.album,
      genre: trackInfo.metadata.album,
      artwork: trackInfo.metadata.pictureURI,
      duration: trackInfo.metadata.durationSeconds,
    };
    queue.push(trackPlayerTrack);
  }
  return queue;
};
/** =============================
 * ON INITIALIZE
 ** ============================= */
export const onInitialize = async () => {
  // await removeFromAsyncStorage("tracks");
  // await removeFromAsyncStorage("playlists");
  const tracks = await loadFromAsyncStorage("tracks");
  const playlists = await loadFromAsyncStorage("playlists");

  useTracksStore.setState({ tracks: tracks || [], playlists: playlists || [] });
  // useTracksStore.setState({ tracks: [], playlists: [] });

  console.log(
    "store INIT # of Tracks",
    useTracksStore.getState().tracks.length
  );
  console.log(
    "store INIT Playlists",
    useTracksStore.getState().playlists.length,
    useTracksStore.getState().playlists.map((id) => `${id.id}-${id.name}`)
  );

  return;
};
