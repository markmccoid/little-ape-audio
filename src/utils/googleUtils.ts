import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { getGoogleAccessToken, storeGoogleAccessToken } from "../store/data/secureStorage";
import { GDrive, MimeTypes } from "@robinbobin/react-native-google-drive-api-wrapper";
import { AUDIO_FORMATS } from "@utils/constants";
import axios from "axios";
import { fromByteArray } from "base64-js";
import * as FileSystem from "expo-file-system";
import { getCleanFileName } from "@store/data/fileSystemAccess";

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
  size: string;
  webContentLink: string;
  mimeType: MimeTypes;
  resourceKey: string;
};

//!! NOT USED this is using @robinbobin/react-native-google-drive-api-wrapper
export const listGoogleFiles = async (folderId: string = undefined) => {
  const accessToken = await getAccessToken();
  gdrive.accessToken = accessToken;

  let query = folderId ? `'${folderId}' in parents` : `'root' in parents`;
  let files: GoogleResponse = undefined;
  try {
    files = await gdrive.files.list({ q: query });
  } catch (err) {
    console.log("ERROR --- ", err.message);
  }
  // return files;
  return separateFilesFolders(files.files);
};

export const getJsonData = async ({
  folderId,
  filename,
}: {
  folderId: string;
  filename: string;
}) => {
  const { files } = await listGoogleDriveFiles(folderId, true);
  for (let file of files) {
    if (file.name === filename) {
      gdrive.accessToken = await getAccessToken();
      const jsonData = gdrive.files.getJson(file.id);
      return jsonData;
      // return file;
    }
  }
  return undefined;
};

export type FilesAndFolders = ReturnType<typeof separateFilesFolders>;
//~ ============================================
//~ listGoogleDriveFiles
//~ ============================================
export const listGoogleDriveFiles = async (
  folderId: string = undefined,
  includeAllFiles: boolean = false
) => {
  const accessToken = await getAccessToken();

  let query = `'${folderId === "/" || !folderId ? "root" : folderId}' in parents`;

  const apiUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,size,mimeType,fileExtension,webContentLink)`;
  const resp = await axios.get(apiUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return separateFilesFolders(resp.data.files, includeAllFiles);
};

//~ -------------------------------------
//~ separateFilesFolders
//~ -------------------------------------
const separateFilesFolders = (list, includeAllFiles: boolean) => {
  let files = [] as FileEntry[];
  let folders = [] as FolderEntry[];
  for (const file of list) {
    if (file.mimeType === MimeTypes.FOLDER) {
      folders.push({ [".tag"]: "folder", path_lower: file.id, id: file.id, name: file.name });
    } else if (
      // push if includeAllFiles OR it is audio.
      includeAllFiles ||
      AUDIO_FORMATS.includes(file.name.slice(file.name.lastIndexOf(".") + 1))
    ) {
      files.push({
        [".tag"]: "file",
        name: file.name,
        path_lower: file.id,
        path_display: file.id,
        id: file.id,
        size: file.size,
        webContentLink: file.webContentLink,
      });
    }
    // else if (AUDIO_FORMATS.includes(file.name.slice(file.name.lastIndexOf(".") + 1))) {
    //   files.push({
    //     [".tag"]: "file",
    //     name: file.name,
    //     path_lower: file.id,
    //     path_display: file.id,
    //     id: file.id,
    //     size: file.size,
    //     webContentLink: file.webContentLink,
    //   });
    // }
  }

  return { files, folders };
};
//~ ---------------------------------------------------
//~ downloadGoogleFiles
//~ downloads the fileId file saves to document dir
//~ with filename (includes extension)
//~ ---------------------------------------------------
export const downloadGoogleFile = async (fileId: string, filename: string) => {
  const accessToken = await getAccessToken();
  const apiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const resp = await axios.get(apiUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    responseType: "arraybuffer",
  });
  // console.log("DATA", resp.data);
  // return await resp.data;
  // Define the path where you want to save the file
  const cleanFileName = getCleanFileName(filename);
  const fileUri = `${FileSystem.documentDirectory}${cleanFileName}`;
  // console.log("Google Write To -> ", fileUri);
  const base64String = fromByteArray(new Uint8Array(resp.data));
  // Write the file to the local file system
  await FileSystem.writeAsStringAsync(fileUri, base64String, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return { cleanFileName };
};
//!! DROPBOX TYPES
type FolderEntry = {
  [".tag"]: "folder"; // Used in ExplorerContianer.tsx, dropboxUtils.ts
  name: string;
  path_lower: string; // Used in ExplorerContianer.tsx, ExplorerFile.tsx, ExplorerFolder.tsx,
  // fileMetadataView.tsx, store-dropbox.ts,
  // addNewTrack in ExplorerFile which is a function in store.js that stores the new track.
  path_display?: string; // NOT USED
  id: string;
};
type FileEntry = {
  [".tag"]: "file";
  name: string;
  path_lower: string;
  path_display: string;
  id: string;
  size: number;
  alreadyDownload?: boolean;
  webContentLink?: string;
};
