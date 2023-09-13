import { loadFromAsyncStorage } from "./data/asyncStorage";
import { useTracksStore } from "./store";
import { useDropboxStore } from "./store-dropbox";
import { useSettingStore } from "./store-settings";

//~ ----------------------------------
//~ ON INITIALIZE
//~ ----------------------------------
export const onInitialize = async () => {
  // await removeFromAsyncStorage("tracks");
  // await removeFromAsyncStorage("playlists");
  // await removeFromAsyncStorage("favfolders");
  // await removeFromAsyncStorage("foldermetadata");
  const tracks = await loadFromAsyncStorage("tracks");
  const playlists = await loadFromAsyncStorage("playlists");
  const favFolders = await loadFromAsyncStorage("favfolders");
  const folderMetadata = await loadFromAsyncStorage("foldermetadata");
  const folderMetadataErrors = await loadFromAsyncStorage(
    "foldermetadataerrors"
  );
  const settings = await loadFromAsyncStorage("settings");

  useTracksStore.setState({ tracks: tracks || [], playlists: playlists || {} });

  useDropboxStore.setState({ favoriteFolders: favFolders });
  useDropboxStore.setState({
    folderMetadata: folderMetadata,
    folderMetadataErrors,
  });
  useDropboxStore.getState().actions.generateFolderMetadataArray();
  useSettingStore.setState({
    ...settings,
    jumpForwardSeconds: settings?.jumpForwardSeconds || 15,
    jumpBackwardSeconds: settings?.jumpBackwardSeconds || 15,
  });

  return;
};
