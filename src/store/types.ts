import { Track } from "react-native-track-player";
import { FileEntry } from "../utils/dropboxUtils";
import { Chapter } from "./store-functions";
import { AudioSourceType } from "@app/audio/dropbox";
import { colors } from "@constants/Colors";
import { CleanBookMetadata } from "@utils/audiobookMetadata";

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
  externalMetadata?: ExternalMetadata;
};
export type AudioMetadata = {
  title?: string;
  album?: string;
  artist?: string;
  narratedBy?: string;
  genre?: string;
  trackRaw?: string;
  trackNum?: number | string;
  totalTracks?: number;
  year?: number;
  durationSeconds?: number;
  pictureURI?: string;
  pictureColors?: PlaylistImageColors;
  pictureAspectRatio?: number;
  comment?: string;
  chapters?: Chapter[];
};

export type ExternalMetadata = CleanBookMetadata & {
  dateDownloaded: string;
};

export type PlaylistImageColors = {
  darkestColor?: string;
  lightestColor?: string;
} & Partial<
  Record<
    "background" | "primary" | "secondary" | "detail",
    {
      color: string;
      colorType: string;
      colorLuminance: number;
      tintColor: string;
    }
  >
>;

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

type CollectionTypes = "music" | "podcast" | "audiobook" | "protected";
export type CollectionItem = {
  id: string;
  name: string;
  color: string;
  type: CollectionTypes;
  headerTitle: string;
};

export type PlaylistId = string;
export type Playlist = {
  id: string;
  name: string;
  author: string;
  lastPlayedDateTime: number;
  overrideTrackImage: boolean;
  imageURI: string; //{ uri: string } | number | undefined;
  imageColors: PlaylistImageColors;
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
  // collection id linking to collection
  collection: CollectionItem;
  // position history stores the last 5 position
  // Helpful if your place in book gets reset accidentally.
  positionHistory: { trackIndex: number; position: number }[];
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
  overrideTrackImage?: boolean;
  imageURI?: string | undefined;
  imageAspectRatio?: number;
  imageType?: "uri" | "imported" | "url";
  imageColors?: PlaylistImageColors;
  collection?: CollectionItem;
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
  collections: CollectionItem[];
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
      // actual text of folder where track is located
      currFolderText,
      // google or dropbox
      audioSource,
      playlistId,
      // Determines if we should calculate the color of the tracks image.
      // We do this for manual download of track, if process all tracks, then expect only first track
      // but this is handled by the calling function
      calculateColor,
      directory,
    }: {
      fileURI: string;
      // filename including extension
      filename: string;
      // file.path_lower
      sourceLocation: string;
      pathIn: string;
      currFolderText: string;
      audioSource: AudioSourceType;
      playlistId?: string;
      calculateColor?: boolean;
      directory?: string;
    }) => Promise<void>;
    updateTrackMetadata: (trackId: string, trackMetadata: Partial<AudioMetadata>) => Promise<void>;
    clearChapterMetadata: (trackId: string) => Promise<void>;
    // given passed id of audioFile, remove it from list AND Delete it from FileSystem storage
    //!! Need to make sure to remove from any playlist if we actually use this function anywhere
    removeTracks: (ids: string[]) => Promise<void>;
    // Will take an array of files (FileEntry[]) and see if that track has already been downloaded
    // to the "tracks" array.  Returns the same array with a "alreadyDownload" key set to true or false
    isTrackDownloaded: (tracksToCheck: FileEntry[]) => FileEntry[];
    // creates playlist with the passed name and returns the playlistId
    addNewPlaylist: (title: string, author?: string, playlistId?: string) => string;
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
    // shouldRemoveFile = true will delete from phone default is true
    // will return playlistId if playlist still exists else undefined
    deleteTrackFromPlaylist: (
      playlistId: string,
      trackToDeleteId: string,
      shouldRemoveFile?: boolean
    ) => Promise<string>;
    updatePlaylistPostionHistory: (
      playlistId: string,
      position: number,
      trackIndex: number
    ) => Promise<void>;
    addBookmarkToPlaylist: (
      bookmarkName: string,
      playlistId: string,
      trackId: string,
      positionSeconds: number
    ) => Promise<void>;
    getBookmarksForPlaylist: (playlistId) => Bookmark[];
    deleteBookmarkFromPlaylist: (playlistId: string, bookmarkId: string) => Promise<void>;
    addOrUpdateCollection: (collection: CollectionItem) => Promise<void>;
    deleteCollection: (collectionId: string) => Promise<void>;
    clearAll: () => Promise<void>;
  };
};

//~ ---------------------------------------------

export type BookInfo = {
  summary?: string;
  length?: string;
  title?: string;
  author?: string;
  narratedBy?: string;
  releaseDate?: string;
  otherCategories?: string[];
  stopFlag?: boolean;
};

export type FolderNameData = {
  title: string;
  year: string;
  author: string;
  category: string;
};
export type GoogleData = {
  id?: string;
  title?: string;
  subTitle?: string;
  authors?: string[];
  description?: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: string;
  categories?: string[];
  imageURL?: string;
  bookDetailsURL?: string;
  isbn?: { type: string; identifier: string }[];
  googleISBNS?: Record<string, string> | undefined;
  query?: string;
  queryDateString?: string;
};

//-- - - - - - - - - - - - - - -
//-- Scanned Folder
//-- - - - - - - - - - - - - - -
export type ScannedFolder = {
  id: string;
  folderId: string;
  fullPath: string;
  folderName: string;
  folderNameData: FolderNameData;
  parentDir: string;
  audioFileCount: number;
  isBookFolder: boolean;
  metadataFileExists: boolean;
  metadataGoogleDataExists: boolean;
  googleAPIData: GoogleData;
  // The image filename is stored in the array
  folderImages: string[];
  bookInfoTextPath: string;
  bookInfo?: BookInfo;
  category?: string;
  subCategory?: string;
};

export type ProcessedBookData = {
  id: string;
  fullPath: string;
  folderName: string;
  title: string;
  subTitle: string | undefined;
  author: string;
  publishedYear: string;
  category: string | undefined;
  subCategory: string | undefined;
  folderImages: string[];
  description: string;
  pageCount: string | undefined;
  narratedBy: string | undefined;
  bookLength: string | undefined;
  imageURL: string | undefined;
  googleBookLink: string | undefined;
  googleQuery: string | undefined;
  googleQueryDate: string | undefined;
};

export const initDefaultCollection: CollectionItem = {
  id: "all",
  name: "All Audio",
  headerTitle: "All Audio",
  color: "#ffffff",
  type: "protected",
};
export const defaultCollections: CollectionItem[] = [
  // {
  //   id: "all",
  //   name: "All",
  //   headerTitle: "All",
  //   color: "#ffffff",
  //   type: "protected",
  // },
  {
    id: "audiobooks",
    name: "Audiobooks",
    color: colors.amber300,
    type: "audiobook",
    headerTitle: "Audiobooks",
  },
  {
    id: "fiction",
    name: "Fiction",
    color: "#03a9f4",
    type: "audiobook",
    headerTitle: "Fiction",
  },
  {
    id: "nonfiction",
    name: "Nonfiction",
    color: "#3f51b5",
    type: "audiobook",
    headerTitle: "Nonfiction",
  },
  {
    id: "music",
    name: "Music",
    color: "#4caf50",
    type: "audiobook",
    headerTitle: "Music",
  },
  {
    id: "youtube videos",
    name: "Youtube Videos",
    color: "#607d8b",
    type: "audiobook",
    headerTitle: "Youtube Videos",
  },
];
