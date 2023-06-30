import { Track } from "react-native-track-player";
import { FileEntry } from "../utils/dropboxUtils";

//~ ================================
//~ AudioTrack Type
//~ ================================
export type AudioTrack = {
  id: string;
  // File URI is ONLY the clean filename.  We use it in conjunction with
  // FileSystem.documentDirectory to build actual full fileURI
  fileURI: string;
  filename: string;
  directory: string;
  sourceLocation: string;
  metadata?: AudioMetadata;
};
export type AudioMetadata = {
  title?: string;
  album?: string;
  artist?: string;
  genre?: string;
  durationSeconds?: number;
  pictureURI?: string;
};

//~ ================================
//~ Playlist Type
//~ ================================
export interface ApeTrack extends Track {
  id: string;
  filename: string;
}

type PlaylistId = string;
export type Playlist = {
  id: string;
  name: string;
  author: string;
  lastPlayedDateTime: number;
  imageURI: { uri: string } | number | undefined;
  imageType: "uri" | "imported" | "url";
  totalDurationSeconds: number;
  totalListenedToSeconds: number;
  trackIds?: string[];
  bookmarks?: Bookmark[];
  currentPosition?: { trackIndex: number; position: number };
  currentRate: number;
};

export type Bookmark = {
  id: string;
  name: string;
  trackId: string;
  positionSeconds: number;
};
type PlaylistUpdateObj = {
  name?: string;
  author?: string;
  lastPlayedDateTime?: number;
  imageURI?: { uri: string } | number | undefined;
  imageType?: "uri" | "imported" | "url";
  //~ Current Position is updated separately
  // currentPosition?: { trackIndex: number; position: number };
  //~ Current Rate has its own update function
  // currentRate: number;
  //~ These need to be updated in a separate function as duration needs to be recalced
  //~ incase tracks added
  //totalDurationSeconds: number;
  //trackIds?: string[];
};
//~ ================================
//~ AudioState => AudioStore Type
//~ ================================
export type AudioState = {
  tracks: AudioTrack[];
  playlists: Record<PlaylistId, Playlist>;
  actions: {
    // given the audio file location in storage, look up metadata and create
    // record in AudioState.audioFiles store array
    addNewTrack: (
      fileURI: string,
      filename: string,
      sourceLocation: string,
      playlistId?: string,
      directory?: string
    ) => void;
    // given passed id of audioFile, remove it from list AND Delete it from FileSystem storage
    removeTracks: (ids: string[]) => Promise<void>;
    // Will take an array of files (FileEntry[]) and see if that track has already been downloaded
    // to the "tracks" array.  Returns the same array with a "alreadyDownload" key set to true or false
    isTrackDownloaded: (tracksToCheck: FileEntry[]) => FileEntry[];
    // creates playlist with the passed name and returns the playlistId
    addNewPlaylist: (
      title: string,
      author?: string,
      playlistId?: string
    ) => Promise<string>;
    // Add track(s) to playlist ID
    addTracksToPlaylist: (
      playlistId: string,
      trackIds: string[]
    ) => Promise<void>;
    removePlaylist: (
      playlistId: string,
      removeAllTracks?: boolean
    ) => Promise<void>;
    getPlaylist: (playlistId: string) => Playlist | undefined;
    getTrack: (trackId: string) => AudioTrack | undefined;
    updatePlaylistRate: (playlistId: string, newRate: number) => void;
    updatePlaylistFields: (
      playlistId: string,
      updateObj: PlaylistUpdateObj
    ) => void;
    updatePlaylistTracks: (
      playlistId: string,
      newTracksArray: string[]
    ) => Promise<void>;
    addBookmarkToPlaylist: (
      bookmarkName: string,
      playlistId: string,
      trackId: string,
      positionSeconds: number
    ) => Promise<void>;
    getBookmarksForPlaylist: (playlistId) => Bookmark[];
    deleteBookmarkFromPlaylist: (
      playlistId: string,
      bookmarkId: string
    ) => Promise<void>;
    clearAll: () => Promise<void>;
  };
};
