// types/audiobookshelf.ts
export interface AuthCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  oldToken: string; // For backwards compatibility
  expiresAt: number; // We'll calculate this client-side
}

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  type: string;
  token: string; // old token
  refreshToken?: string; // Only present when x-return-tokens header is used
  accessToken: string; // new JWT
  // ... other user properties
}

export interface LoginResponse {
  user: User;
  userDefaultLibraryId: string;
  serverSettings: ServerSettings;
  ereaderDevices: unknown[]; // Empty array in the data, type unknown
  Source: string;
}

export interface LogoutResponse {
  redirect_url?: string; // For OIDC logout
}

// Error classes remain the same
export class AudiobookshelfError extends Error {
  constructor(message: string, public code: string, public statusCode?: number) {
    super(message);
    this.name = "AudiobookshelfError";
  }
}

export class AuthenticationError extends AudiobookshelfError {
  constructor(message: string = "Authentication failed") {
    super(message, "AUTH_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

export class NetworkError extends AudiobookshelfError {
  constructor(message: string = "Network connection failed") {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}

interface MediaProgress {
  id: string;
  userId: string;
  libraryItemId: string;
  episodeId: string | null;
  mediaItemId: string;
  mediaItemType: "book" | "podcast";
  duration: number;
  progress: number;
  currentTime: number;
  isFinished: boolean;
  hideFromContinueListening: boolean;
  ebookLocation: string | null;
  ebookProgress: number | null;
  lastUpdate: number;
  startedAt: number;
  finishedAt: number | null;
}

interface Bookmark {
  libraryItemId: string;
  time: number;
  title: string;
  createdAt: number;
}

interface UserPermissions {
  download: boolean;
  update: boolean;
  delete: boolean;
  upload: boolean;
  accessAllLibraries: boolean;
  accessAllTags: boolean;
  selectedTagsNotAccessible: boolean;
  accessExplicitContent: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  type: "user" | "admin" | "guest";
  token: string;
  isOldToken: boolean;
  mediaProgress: MediaProgress[];
  seriesHideFromContinueListening: string[];
  bookmarks: Bookmark[];
  isActive: boolean;
  isLocked: boolean;
  lastSeen: number;
  createdAt: number;
  permissions: UserPermissions;
  librariesAccessible: string[];
  itemTagsSelected: string[];
  hasOpenIDLink: boolean;
  refreshToken: string;
  accessToken: string;
}

interface ServerSettings {
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
  allowIframe: boolean;
  backupPath: string;
  backupSchedule: string;
  backupsToKeep: number;
  maxBackupSize: number;
  loggerDailyLogsToKeep: number;
  loggerScannerLogsToKeep: number;
  homeBookshelfView: number;
  bookshelfView: number;
  podcastEpisodeSchedule: string;
  sortingIgnorePrefix: boolean;
  sortingPrefixes: string[];
  chromecastEnabled: boolean;
  dateFormat: string;
  timeFormat: string;
  language: string;
  logLevel: number;
  version: string;
  buildNumber: number;
  authLoginCustomMessage: string | null;
  authActiveAuthMethods: string[];
  authOpenIDIssuerURL: string | null;
  authOpenIDAuthorizationURL: string | null;
  authOpenIDTokenURL: string | null;
  authOpenIDUserInfoURL: string | null;
  authOpenIDJwksURL: string | null;
  authOpenIDLogoutURL: string | null;
  authOpenIDTokenSigningAlgorithm: string;
  authOpenIDButtonText: string;
  authOpenIDAutoLaunch: boolean;
  authOpenIDAutoRegister: boolean;
  authOpenIDMatchExistingBy: string | null;
}
