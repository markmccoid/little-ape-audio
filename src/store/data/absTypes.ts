//~~ ========================================================
//~~ Login API Call Response -
//~~ ========================================================
export type ABSLoginResponse = {
  user: User;
  userDefaultLibraryId: string;
  serverSettings: ServerSettings;
  Source: string;
};

type User = {
  id: string;
  username: string;
  email: string;
  type: string;
  token: string;
  mediaProgress: MediaProgress[];
  seriesHideFromContinueListening: string[];
  bookmarks: any[]; // You may want to replace 'any' with a more specific type
  isActive: boolean;
  isLocked: boolean;
  lastSeen: number;
  createdAt: number;
  permissions: Permissions;
  librariesAccessible: string[];
  itemTagsAccessible: string[];
};

type MediaProgress = {
  id: string;
  libraryItemId: string;
  episodeId: string;
  duration: number;
  progress: number;
  currentTime: number;
  isFinished: boolean;
  hideFromContinueListening: boolean;
  lastUpdate: number;
  startedAt: number;
  finishedAt: number | null;
};

type Permissions = {
  download: boolean;
  update: boolean;
  delete: boolean;
  upload: boolean;
  accessAllLibraries: boolean;
  accessAllTags: boolean;
  accessExplicitContent: boolean;
};

type ServerSettings = {
  id: string;
  scannerFindCovers: boolean;
  scannerCoverProvider: string;
  scannerParseSubtitle: boolean;
  scannerPreferMatchedMetadata: boolean;
  scannerDisableWatcher: boolean;
  storeCoverWithItem: boolean;
  storeMetadataWithItem: boolean;
  metadataFileFormat: string;
  rateLimitLoginRequests: number;
  rateLimitLoginWindow: number;
  backupSchedule: string;
  backupsToKeep: number;
  maxBackupSize: number;
  loggerDailyLogsToKeep: number;
  loggerScannerLogsToKeep: number;
  homeBookshelfView: number;
  bookshelfView: number;
  sortingIgnorePrefix: boolean;
  sortingPrefixes: string[];
  chromecastEnabled: boolean;
  dateFormat: string;
  language: string;
  logLevel: number;
  version: string;
};

//~~ ========================================================
//~~ Library Type -
//~~ ========================================================
export type Library = {
  id: string;
  name: string;
  folders: {
    id: string;
    fullPath: string;
    libraryId: string;
    addedAt: number;
  }[];
  displayOrder: number;
  icon: string;
  mediaType: string;
  provider: string;
  settings: {
    coverAspectRatio: number;
    disableWatcher: boolean;
    skipMatchingMediaWithAsin: boolean;
    skipMatchingMediaWithIsbn: boolean;
    autoScanCronExpression: string | null;
  };
  createdAt: number;
  lastUpdate: number;
};

export type FilterData = {
  authors: { id: string; name: string }[];
  genres: string[];
  tags: string[];
  series: { id: string; name: string }[];
  narrators: string[];
  languages: string[];
};

export type LibraryGetResponse = {
  filterdata: FilterData;
  issues: number;
  numUserPlaylists: number;
  library: Library;
};
//~~ ========================================================
//~~ Library Items Type -
//~~ ========================================================
export type GetLibraryItemsResponse = {
  results: LibraryItemResult[];
  total: number;
  limit: number;
  page: number;
  sortBy: string;
  sortDesc: boolean;
  filterBy: string;
  mediaType: string;
  minified: boolean;
  collapseseries: boolean;
  include: string;
};

type LibraryItemResult = {
  id: string;
  ino: string;
  libraryId: string;
  folderId: string;
  path: string;
  relPath: string;
  isFile: boolean;
  mtimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
  addedAt: number;
  updatedAt: number;
  isMissing: boolean;
  isInvalid: boolean;
  mediaType: string;
  media: {
    metadata: {
      title: string;
      titleIgnorePrefix: string;
      subtitle: string | null;
      authorName: string;
      narratorName: string;
      seriesName: string;
      genres: string[];
      publishedYear: string;
      publishedDate: string | null;
      publisher: string;
      description: string;
      isbn: string | null;
      asin: string;
      language: string | null;
      explicit: boolean;
    };
    coverPath: string;
    tags: string[];
    numTracks: number;
    numAudioFiles: number;
    numChapters: number;
    duration: number;
    size: number;
    ebookFileFormat: string | null;
  };
  numFiles: number;
  size: number;
  collapsedSeries: {
    id: string;
    name: string;
    nameIgnorePrefix: string;
    numBooks: number;
  };
};

//~~ ========================================================
//~~ Library Book Type -
//~~ ========================================================
type libraryFile = {
  ino: string;
  metadata: {
    filename: string;
    ext: string;
    // The absolute path on the server of the file.
    path: string;
    // The path of the file, relative to the book's or podcast's folder
    relPath: string;
    // The size (in bytes) of the file.
    size: number;
    // The time (in ms since POSIX epoch) when the file was last modified on disk.
    mtimeMs: number;
    // The time (in ms since POSIX epoch) when the file status was changed on disk.
    ctimeMs: number;
    // The time (in ms since POSIX epoch) when the file was created on disk. Will be 0 if unknown.
    birthtimeMs: number;
  };
  isSupplementary: boolean;
  // The time (in ms since POSIX epoch) when the library file was added.
  addedAt: number;
  // The time (in ms since POSIX epoch) when the library file was last updated.
  updatedAt: number;
  //The type of file that the library file is (audio, image, etc.)
  fileType: string;
};

type ABSMediaMetadata = {
  title: string;
  titleIgnorePrefix: string;
  subtitle: string;
  authors: Author[];
  narrators: string[];
  series: Series[];
  genres: string[];
  publishedYear: string;
  publishedDate: string | null;
  publisher: string;
  description: string;
  isbn: string | null;
  asin: string | null;
  language: string;
  explicit: boolean;
  authorName: string;
  authorNameLF: string;
  narratorName: string;
  seriesName: string;
  abridged: boolean;
};

// https://abs.mccoidco.xyz/api/items/260fdcda-1c5d-45d8-b24f-b57b9b8e66fa?expanded=1&token=<KEY>
export type LibraryBookExtended = {
  // books id
  id: string;
  // ino seems to be another type of identifier
  ino: string;
  oldLibraryItemId: string;
  // Library that the book is located in
  libraryId: string;
  folderId: string;
  // Path on the source system
  path: string;
  relPath: string;
  // Whether the library item is a single file in the root of the library folder.
  isFile: boolean;
  // The time (in ms since POSIX epoch) when the library item was last modified on disk.
  mtimeMs: number;
  // The time (in ms since POSIX epoch) when the library item status was changed on disk.
  ctimeMs: number;
  // The time (in ms since POSIX epoch) when the library item was created on disk. Will be `0` if unknown.
  birthtimeMs: number;
  // The time (in ms since POSIX epoch) when the library item was added to the library.
  addedAt: number;
  // The time (in ms since POSIX epoch) when the library item was last updated. (Read Only)
  updatedAt: number;
  lastScan: number;
  scanVersion: string;
  // Whether the library item was scanned and no longer exists
  isMissing: boolean;
  // Whether the library item was scanned and no longer has media files.
  isInvalid: boolean;
  // book or podcast
  mediaType: string;
  media: {
    id: string;
    // The ID of the library item that contains the book
    libraryItemId: string;
    metadata: ABSMediaMetadata;
    coverPath: string;
    tags: any[];
    audioFiles: {
      index: number;
      // The inode of the audio file.  Used to identify the specific file for download
      ino: string;
      metadata: {
        filename: string;
        ext: string;
        path: string;
        relPath: string;
        size: number;
        // The time (in ms since POSIX epoch) when the file was last modified on disk
        mtimeMs: number;
        // The time (in ms since POSIX epoch) when the file status was changed on disk.
        ctimeMs: number;
        // The time (in ms since POSIX epoch) when the file was created on disk. Will be `0` if unknown.
        birthtimeMs: number;
      };
      // The time (in ms since POSIX epoch) when the audio file was added to the library.
      addedAt: number;
      // The time (in ms since POSIX epoch) when the audio file last updated. (Read Only)
      updatedAt: number;
      // The track number of the audio file as pulled from the file's metadata.
      trackNumFromMeta: number | null;
      discNumFromMeta: number | null;
      trackNumFromFilename: number | null;
      discNumFromFilename: number | null;
      manuallyVerified: boolean;
      exclude: boolean;
      error: any | null;
      format: string;
      // The total length (in seconds) of the audio file.
      duration: number;
      bitRate: number;
      language: string | null;
      codec: string;
      timeBase: string;
      channels: number;
      channelLayout: string;
      chapters: {
        id: string;
        start: number;
        end: number;
        title: string;
      }[];
      embeddedCoverArt: any | null;
      metaTags: {
        tagArtist: string;
        tagGenre: string;
        tagTitle: string;
        tagTrack: string;
      };
      mimeType: string;
    }[];
    chapters: any[];
    // The total length (in seconds) of the book. This includes all audio files
    duration: number;
    // The total size (in bytes) of the book. This includes all audio files
    size: number;
    // The book's audio tracks from the audio files.
    // Similar to the audio files section, but with offset in relation to other tracks
    tracks: {
      index: number;
      startOffset: number;
      duration: number;
      title: string;
      contentUrl: string;
      mimeType: string;
      codec: string;
      metadata: {
        filename: string;
        ext: string;
        path: string;
        relPath: string;
        size: number;
        mtimeMs: number;
        ctimeMs: number;
        birthtimeMs: number;
      };
    }[];
    ebookFile: any | null;
  };
  // A list of all of the files for the library Item (book)
  // would include the metadata items if needed. Use the ino of a metadata file to download it
  // using the same api as the audio files
  libraryFiles: libraryFile[];
  size: number;
};

//!!!!!!!!!!!!!!!!

type Author = {
  id: string;
  name: string;
};

type Series = {
  id: string;
  name: string;
};

type Metadata = {
  title: string;
  subtitle: string | null;
  authorNameLF: string;
  authorName: string;
  authors: Author[];
  narratorName: string;
  narrators: string[];
  series: Series[];
  genres: string[];
  publishedYear: string;
  publishedDate: string | null;
  publisher: string | null;
  description: string;
  isbn: string | null;
  asin: string;
  language: string | null;
  explicit: boolean;
  abridged: boolean;
};

type AudioFileMetadata = {
  filename: string;
  ext: string;
  path: string;
  relPath: string;
  size: number;
  mtimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
};

type Chapter = {
  id: number;
  start: number;
  end: number;
  title: string;
};

export type AudioFile = {
  index: number;
  ino: string;
  metadata: AudioFileMetadata;
  addedAt: number;
  updatedAt: number;
  trackNumFromMeta: number | null;
  discNumFromMeta: number | null;
  trackNumFromFilename: number | null;
  discNumFromFilename: number | null;
  manuallyVerified: boolean;
  exclude: boolean;
  error: string | null;
  format: string;
  duration: number;
  bitRate: number;
  language: string;
  codec: string;
  timeBase: string;
  channels: number;
  channelLayout: string;
  chapters: Chapter[];
  embeddedCoverArt: string;
  metaTags: { [key: string]: string };
  mimeType: string;
};

type LibraryFileMetadata = {
  filename: string;
  ext: string;
  path: string;
  relPath: string;
  size: number;
  mtimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
};

type LibraryFile = {
  ino: string;
  metadata: LibraryFileMetadata;
  isSupplementary: boolean | null;
  addedAt: number;
  updatedAt: number;
  fileType: string;
};

export type EbookFile = {
  ino: string;
  metadata: LibraryFileMetadata;
  ebookFormat: string;
  addedAt: number;
  updatedAt: number;
};

export type Media = {
  id: string;
  libraryItemId: string;
  metadata: Metadata;
  coverPath: string;
  tags: string[];
  audioFiles: AudioFile[];
  chapters: Chapter[];
  ebookFile: EbookFile | null;
};

export type UserMediaProgress = {
  id: string;
  libraryItemId: string;
  episodeId: null;
  duration: number;
  progress: number;
  currentTime: number;
  isFinished: boolean;
  hideFromContinueListening: boolean;
  lastUpdate: number;
  startedAt: number;
  finishedAt: null;
};
export type LibraryItem = {
  id: string;
  ino: string;
  oldLibraryItemId: string | null;
  libraryId: string;
  folderId: string;
  path: string;
  relPath: string;
  isFile: boolean;
  mtimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
  addedAt: number;
  updatedAt: number;
  lastScan: number;
  scanVersion: string;
  isMissing: boolean;
  isInvalid: boolean;
  mediaType: string;
  media: Media;
  libraryFiles: LibraryFile[];
  userMediaProgress: UserMediaProgress;
};
