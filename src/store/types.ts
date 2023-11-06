import { Chapters } from "./../utils/audioUtils";
import { Track } from "react-native-track-player";
import { FileEntry } from "../utils/dropboxUtils";
import { Chapters } from "@utils/audioUtils";
import { Chapter } from "./store-functions";
import { AudioSourceType } from "@app/audio/dropbox";

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
  narratedBy?: string;
  genre?: string;
  trackRaw?: string;
  trackNum?: number;
  totalTracks?: number;
  year?: number;
  durationSeconds?: number;
  pictureURI?: string;
  pictureAspectRatio?: number;
  comment?: string;
  chapters?: Chapters[];
};

export type Chapters = {
  id: string;
  description: string;
  startTime: number;
  endTime: number;
  duration: number;
};
//~ ================================
//~ Playlist Type
//~ ================================
export interface ApeTrack extends Track {
  id: string;
  filename: string;
  // The track number pulled from the metadata info
  trackNum: number;
  chapters: Chapter[];
}
export type TrackAttributes = {
  currentPosition: number;
};
type TrackId = string;

type PlaylistId = string;
export type Playlist = {
  id: string;
  name: string;
  author: string;
  lastPlayedDateTime: number;
  imageURI: string; //{ uri: string } | number | undefined;
  imageAspectRatio: number;
  //! imageType is depricated TEST GETTING RID OF
  imageType: "uri" | "imported" | "url";
  genre: string;
  totalDurationSeconds: number;
  totalListenedToSeconds: number;
  trackIds?: string[];
  // Array of attributes that lines up with the tracks in the trackplayer queue
  trackAttributes: Record<TrackId, TrackAttributes>;
  bookmarks?: Bookmark[];
  currentPosition?: { trackIndex: number; position: number };
  currentRate: number;
  // position history stores the last 5 position
  // Helpful if your place in book gets reset accidentally.
  positionHistory: number[];
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
  imageURI?: string | undefined;
  imageAspectRatio?: number;
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
  playlistUpdated: Date;
  actions: {
    // given the audio file location in storage, look up metadata and create
    // record in AudioState.audioFiles store array
    addNewTrack: ({
      // Bad name, this is just the clean file name
      fileURI,
      // filename including extension (not cleaned)
      filename,
      // file.path_lower
      sourceLocation,
      // folder path or folderId (google) of folder file lives in
      pathIn,
      // google or dropbox
      audioSource,
      playlistId,
      directory,
    }: {
      fileURI: string;
      // filename including extension
      filename: string;
      // file.path_lower
      sourceLocation: string;
      pathIn: string;
      audioSource: AudioSourceType;
      playlistId?: string;
      directory?: string;
    }) => void;
    // given passed id of audioFile, remove it from list AND Delete it from FileSystem storage
    //!! Need to make sure to remove from any playlist if we actually use this function anywhere
    removeTracks: (ids: string[]) => Promise<void>;
    // Will take an array of files (FileEntry[]) and see if that track has already been downloaded
    // to the "tracks" array.  Returns the same array with a "alreadyDownload" key set to true or false
    isTrackDownloaded: (tracksToCheck: FileEntry[]) => FileEntry[];
    // creates playlist with the passed name and returns the playlistId
    addNewPlaylist: (title: string, author?: string, playlistId?: string) => Promise<string>;
    // Add track(s) to playlist ID
    addTracksToPlaylist: (playlistId: string, trackIds: string[]) => Promise<void>;
    removePlaylist: (playlistId: string, removeAllTracks?: boolean) => Promise<void>;
    getPlaylist: (playlistId: string) => Playlist | undefined;
    getTrack: (trackId: string) => AudioTrack | undefined;
    // Given a playlist ID, will return an array of tracks (with metadata,etc)
    getPlaylistTracks: (playlistId: string) => AudioTrack[];
    updatePlaylistRate: (playlistId: string, newRate: number) => void;
    updatePlaylistFields: (playlistId: string, updateObj: PlaylistUpdateObj) => Promise<void>;
    updatePlaylistTracks: (playlistId: string, newTracksArray: string[]) => Promise<void>;
    deleteTrackFromPlaylist: (playlistId: string, trackToDeleteId: string) => Promise<void>;
    updatePlaylistPostionHistory: (playlistId: string, position?: number) => Promise<void>;
    addBookmarkToPlaylist: (
      bookmarkName: string,
      playlistId: string,
      trackId: string,
      positionSeconds: number
    ) => Promise<void>;
    getBookmarksForPlaylist: (playlistId) => Bookmark[];
    deleteBookmarkFromPlaylist: (playlistId: string, bookmarkId: string) => Promise<void>;
    clearAll: () => Promise<void>;
  };
};
