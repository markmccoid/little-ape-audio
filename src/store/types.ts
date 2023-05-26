import { FileEntry } from "../utils/dropboxUtils";

//~ ================================
//~ AudioTrack Type
//~ ================================
export type AudioTrack = {
  id: string;
  // Full path to the file
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
export type Playlist = {
  id: string;
  name: string;
  author: string;
  imageURI: string | undefined;
  totalDurationSeconds: number;
  trackIds?: string[];
  currentPosition?: { trackIndex: number; position: number };
  currentRate: number;
};

//~ ================================
//~ AudioState => AudioStore Type
//~ ================================
export type AudioState = {
  tracks: AudioTrack[];
  playlists: Playlist[];
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
    removePlaylist: (playlistId: string, removeAllTracks?: boolean) => void;
    getPlaylist: (playlistId: string) => Playlist | undefined;
    getTrack: (trackId: string) => AudioTrack | undefined;
    clearAll: () => Promise<void>;
  };
};
