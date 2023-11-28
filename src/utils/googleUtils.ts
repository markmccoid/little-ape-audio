import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GDrive, MimeTypes } from "@robinbobin/react-native-google-drive-api-wrapper";
import { AUDIO_FORMATS } from "@utils/constants";
import axios from "axios";
// import { getCleanFileName } from "@store/data/fileSystemAccess";
const gdrive = new GDrive();

import sortBy from "lodash/sortBy";

export const getAccessToken = async () => {
  // let tokens = undefined;
  try {
    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken;
  } catch (e) {
    // console.log("Sign In Silently !!!!!!");
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

  // If root folder we get "/" need to cover to "root"
  // otherwise use passed in folderId
  let query = `'${folderId === "/" || !folderId ? "root" : folderId}' in parents and trashed=false`;

  const apiUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,size,mimeType,fileExtension,webContentLink)`;
  const resp = await axios.get(apiUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  // Separate folders and Files
  const filteredFoldersFiles = separateFilesFolders(resp.data.files, includeAllFiles);

  //- Success reading directory, return data
  return filteredFoldersFiles;
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
  }
  folders = sortBy(folders, [(o) => o.name.toLowerCase()]);
  files = sortBy(files, [(o) => o.name.toLowerCase()]);
  return { files, folders };
};
//~ ---------------------------------------------------
//~ downloadGoogleFiles
//~ downloads the fileId file saves to document dir
//~ with filename (includes extension)
//~ ---------------------------------------------------
// export const downloadGoogleFile = async (
//   fileId: string,
//   filename: string,
//   progress: (res: DownloadProgressCallbackResult) => void
// ) => {
//   const accessToken = await getAccessToken();
// //  IF YOU USE THIS HERE you will get "require cycles"
//   const cleanFileName = getCleanFileName(filename);
//   const fileUri = `${FileSystem.documentDirectory}${cleanFileName}`;

//   try {
//     const res = rnfs.downloadFile({
//       fromUrl: `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
//       toFile: fileUri,
//       headers: { Authorization: `Bearer ${accessToken}` },
//       begin: (dl) => {},
//       progress: progress,
//       progressInterval: 100,
//     });

//     const stopDownload = () => rnfs.stopDownload(res.jobId);
//     const startDownload = async () => await res.promise;
//     return { cleanFileName, stopDownload, startDownload };
//   } catch (err) {
//     console.log("downloadGoogleFile ERR --> ", err.code);
//   }
// };
//~ ------------------------------------------------------------------------------------

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
