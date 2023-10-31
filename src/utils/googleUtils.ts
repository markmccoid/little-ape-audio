import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { getGoogleAccessToken, storeGoogleAccessToken } from "../store/data/secureStorage";
import { GDrive, MimeTypes } from "@robinbobin/react-native-google-drive-api-wrapper";
import { AUDIO_FORMATS } from "@store/store-dropbox";
import axios from "axios";

const gdrive = new GDrive();

export const getAccessToken = async () => {
  // let tokens = undefined;
  try {
    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken;
  } catch (e) {
    console.log("Sign In Silently !!!!!!");
    await GoogleSignin.signInSilently();
    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken;
  }
};

export type GoogleResponse = {
  nextPageToken?: string;
  kind: string;
  incompleteSearch: boolean;
  files: GoogleFile[];
};
export type GoogleFile = {
  id: string;
  name: string;
  kind: string;
  mimeType: MimeTypes;
  resourceKey: string;
};
export const listGoogleFiles = async (folderId: string = undefined) => {
  const accessToken = await getAccessToken();
  gdrive.accessToken = accessToken;

  let query = folderId ? `'${folderId}' in parents` : `'root' in parents`;
  let files: GoogleResponse = undefined;
  try {
    files = await gdrive.files.list({ q: query });
  } catch (err) {
    console.log("ERR", err.message);
  }
  // return files;
  return separateFilesFolder(files.files);
};

export type FilesAndFolders = ReturnType<typeof separateFilesFolder>;
const separateFilesFolder = (list: GoogleFile[]) => {
  let files = [];
  let folders = [];
  for (const file of list) {
    if (file.mimeType === MimeTypes.FOLDER) {
      console.log("FOLDER", file.name);
      folders.push(file);
    } else if (AUDIO_FORMATS.includes(file.name.slice(file.name.lastIndexOf(".") + 1))) {
      files.push(file);
    }
  }

  return { files, folders };
};

export const listFiles = async (folderId: string = undefined) => {
  const accessToken = await getAccessToken();
  // console.log(accessToken);

  let query = folderId ? `'${folderId}' in parents` : `'root' in parents`;

  const apiUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,size,mimeType,fileExtension)`;
  console.log("API", apiUrl);
  const resp = await axios.get(apiUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  console.log("Response", resp.data.files);
  return separateFilesFolder(resp.data.files);
};

//!! DROPBOX TYPES
type FolderEntry = {
  [".tag"]: "folder"; // Used in ExplorerContianer.tsx, dropboxUtils.ts
  name: string;
  path_lower: string; // Used in ExplorerContianer.tsx, ExplorerFile.tsx, ExplorerFolder.tsx,
  // fileMetadataView.tsx, store-dropbox.ts,
  // addNewTrack in ExplorerFile which is a function in store.js that stores the new track.
  path_display: string; // NOT USED
  id: string;
  favorited?: boolean;
  favoriteId?: string;
};
type FileEntry = {
  [".tag"]: "file";
  name: string;
  path_lower: string;
  path_display: string;
  id: string;
  client_modified: string;
  server_modified: string;
  rev: string;
  size: number;
  is_downloadable: boolean;
  content_hash: string;
  alreadyDownload?: boolean;
};
