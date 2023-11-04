import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { getGoogleAccessToken, storeGoogleAccessToken } from "../store/data/secureStorage";
import { GDrive, MimeTypes } from "@robinbobin/react-native-google-drive-api-wrapper";
import { AUDIO_FORMATS } from "@utils/constants";
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

export const getGoogleDownloadLink = async ({
  folderId,
  filename,
}: {
  folderId: string;
  filename: string;
}) => {
  const { files } = await listGoogleDriveFiles(folderId);
  for (let file of files) {
    if (file.name === filename) {
      return file;
    }
  }
  return undefined;
};

export type FilesAndFolders = ReturnType<typeof separateFilesFolder>;
//~ ============================================
//~ listGoogleDriveFiles
//~ ============================================
export const listGoogleDriveFiles = async (folderId: string = undefined) => {
  const accessToken = await getAccessToken();
  console.log("List GDRIVE", folderId);
  // console.log("ACCESS", accessToken);

  let query = `'${folderId === "/" || !folderId ? "root" : folderId}' in parents`;

  const apiUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,size,mimeType,fileExtension,webContentLink)`;
  const resp = await axios.get(apiUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  console.log("API", apiUrl);
  // console.log("Response", resp.data.files);
  return separateFilesFolders(resp.data.files);
};

//~ -------------------------------------
//~ separateFilesFolders
//~ -------------------------------------
const separateFilesFolders = (list) => {
  let files = [] as FileEntry[];
  let folders = [] as FolderEntry[];
  for (const file of list) {
    if (file.mimeType === MimeTypes.FOLDER) {
      // console.log("FOLDER", file.name);
      folders.push({ [".tag"]: "folder", path_lower: file.id, id: file.id, name: file.name });
    } else if (AUDIO_FORMATS.includes(file.name.slice(file.name.lastIndexOf(".") + 1))) {
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
  }

  return { files, folders };
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
