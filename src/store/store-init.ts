import { absGetLibraryItems, absGetUserInfo } from "./data/absAPI";
import {
  loadFromAsyncStorage,
  removeFromAsyncStorage,
  saveToAsyncStorage,
} from "./data/asyncStorage";
import { useTracksStore } from "./store";
import { useABSStore } from "./store-abs";
import { useDropboxStore } from "./store-dropbox";
import { useSettingStore } from "./store-settings";
import { Playlist, defaultCollections } from "./types";

// Current store version - increment this when making breaking changes
const STORE_VERSION = 1.1;

//~ ----------------------------------
//~ MIGRATIONS
//~ ----------------------------------

/**
 * Migrates playlists to the current version
 * @param playlists Current playlists object
 * @param tracks All tracks
 * @returns Object with migrated playlists and whether any changes were made
 */
const migratePlaylists = (playlists: Record<string, Playlist>, tracks: any[]) => {
  if (!playlists) return { playlists, changed: false };

  let changed = false;
  const migratedPlaylists = { ...playlists };
  const trackMap = new Map(tracks?.map((track) => [track.id, track]) || []);

  for (const [playlistId, playlist] of Object.entries(migratedPlaylists)) {
    // Skip if no tracks in playlist
    if (!playlist.trackIds?.length) continue;

    const firstTrackId = playlist.trackIds[0];
    const track = trackMap.get(firstTrackId);

    // Skip if track not found OR if playlist already has audioSource
    if (!track || playlist?.source) continue;

    // Get audioSource from track or default to "local"
    const audioSource = track.externalMetadata?.audioSource || "local";
    const needsSourceUpdate = !("source" in playlist) || playlist.source !== audioSource;

    // Special handling for ABS playlists
    if (audioSource === "abs" && track.sourceLocation?.includes("~")) {
      const newId = track.sourceLocation.split("~")[0];
      const idWillChange = playlist.id !== newId;

      if (idWillChange || needsSourceUpdate) {
        const updatedPlaylist = {
          ...playlist,
          id: idWillChange ? newId : playlist.id,
          source: audioSource,
        };

        // If the ID changed, we need to delete the old entry
        if (idWillChange) {
          delete migratedPlaylists[playlistId];
          migratedPlaylists[newId] = updatedPlaylist;
        } else {
          migratedPlaylists[playlistId] = updatedPlaylist;
        }

        changed = true;
      }
    }
    // For non-ABS playlists, just update the source if needed
    else if (needsSourceUpdate) {
      migratedPlaylists[playlistId] = {
        ...playlist,
        source: audioSource,
      };
      changed = true;
    }
  }

  return { playlists: migratedPlaylists, changed };
};

//~ ----------------------------------
//~ ON INITIALIZE
//~ ----------------------------------
export const onInitialize = async () => {
  // await removeFromAsyncStorage("playlists");
  // await removeFromAsyncStorage("favfolders");
  // await removeFromAsyncStorage("foldermetadata");
  // await removeFromAsyncStorage("settings");
  const tracks = await loadFromAsyncStorage("tracks");
  // const tracks = tracksx.map((el) => ({
  //   ...el,
  //   metadata: { ...el.metadata, chapters: undefined },
  // }));
  let playlists = await loadFromAsyncStorage("playlists");
  // In onInitialize, before migration:
  // console.log(
  //   "Before migration:",
  //   playlists.map((el) => `${el.id}: ${el.source}`)
  // );
  const favFolders = await loadFromAsyncStorage("favfolders");
  const folderMetadata = await loadFromAsyncStorage("foldermetadata");
  const folderAttributes = await loadFromAsyncStorage("folderattributes");
  const folderMetadataErrors = await loadFromAsyncStorage("foldermetadataerrors");
  const laabMetaAggrControls = await loadFromAsyncStorage("laabmetaaggrcontrols");
  const collections = await loadFromAsyncStorage("collections");
  const settings = await loadFromAsyncStorage("settings");
  const audiobookshelfSettings = await loadFromAsyncStorage("absSettings");
  const storeVersion = (await loadFromAsyncStorage("storeVersion")) || 0;

  //# Run migrations if needed
  if (storeVersion < STORE_VERSION) {
    // Migration for playlists
    if (storeVersion < 1) {
      const { playlists: migratedPlaylists, changed } = migratePlaylists(
        playlists || {},
        tracks || []
      );
      if (changed) {
        playlists = migratedPlaylists;
        // Save the migrated playlists
        await saveToAsyncStorage("playlists", playlists);
      }
    }
    // Update store version
    await saveToAsyncStorage("storeVersion", STORE_VERSION);
  }

  useTracksStore.setState({
    tracks: tracks || [],
    playlists: playlists || {},
    collections: collections || defaultCollections,
  });

  // ******************
  // * patch favFolders
  if (favFolders) {
    const patchedFavs =
      favFolders &&
      favFolders.map((folder) => ({
        ...folder,
        audioSource: folder?.audioSource ? folder.audioSource : "dropbox",
      }));
    saveToAsyncStorage("favfolders", patchedFavs);
    useDropboxStore.setState({ favoriteFolders: patchedFavs });
  }
  // * Patch playlist collections
  if (playlists) {
    for (const key of Object.keys(playlists)) {
      if (!playlists[key]?.collection) {
        playlists[key].collection = {};
      }
    }
  }
  // ******************
  const laabMetaDefault = {
    folders: [],
    lastExecutionDate: Math.floor(new Date().getTime() - 24 * 60 * 60),
    enabled: false,
  };
  useDropboxStore.setState({
    folderMetadata: folderMetadata || {},
    folderAttributes: folderAttributes || [],
    folderMetadataErrors: folderMetadataErrors || [],
    laabMetaAggrControls: laabMetaAggrControls || laabMetaDefault,
  });

  useSettingStore.setState({
    ...settings,
    jumpForwardSeconds: settings?.jumpForwardSeconds || 15,
    jumpBackwardSeconds: settings?.jumpBackwardSeconds || 15,
  });
  // Grab actions so we can reapply and not lose them when setting the other values
  const absActions = useABSStore.getState().actions;
  useABSStore.setState({
    ...audiobookshelfSettings,
    // searchObject: {},
    actions: absActions,
  });

  //# Load All bookmarks from ABS and merge with local bookmarks
  // const userInfo = await absGetUserInfo();
  // if (userInfo.bookmarks) {
  await useTracksStore.getState().actions.mergeABSBookmarks();
  // }
};
