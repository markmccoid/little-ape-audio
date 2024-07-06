// import uuid from "react-native-uuid";
// import { useTracksStore } from "@store/store";
// import { FileEntry, getDropboxFileLink } from "@utils/dropboxUtils";
import * as FileSystem from "expo-file-system";
// import rnfs, { DownloadProgressCallbackResult } from "react-native-fs";
import { AudioSourceType } from "@app/audio/dropbox";
import { getAccessToken } from "@utils/googleUtils";

import ReactNativeBlobUtil from "react-native-blob-util";

//--============================================================
//-- readFileSystem - Reads file system from Root dir
//-- starting dir is FileSystem.documentDirectory
//--============================================================
export const readFileSystemDir = async (dirName = "") => {
  let filesInSystem: string[] = [];
  if (FileSystem.documentDirectory) {
    try {
      filesInSystem = await FileSystem.readDirectoryAsync(
        `${FileSystem.documentDirectory}${dirName}`
      );
    } catch (e) {
      console.log("Error reading file System Directory", e);
    }
  }

  return filesInSystem;
};
//--============================================================
//-- deleteFromFileSystem -
//--============================================================
export const deleteFromFileSystem = async (path?: string, includesDocDirectory = true) => {
  if (!path) return;
  let finalPath = path;
  if (!includesDocDirectory) {
    finalPath = `${FileSystem.documentDirectory}${path}`;
  }
  try {
    await FileSystem.deleteAsync(finalPath);
  } catch (e) {
    // console.log(`Error Deleting ${path}`, e);
  }
};

//--============================================================
//-- downloadToFileSystem - Downloads the file to the dir path specificed
//-- starting dir is FileSystem.documentDirectory
//--============================================================
// This function is used primarily for downloading images from Dropbox
export const downloadToFileSystem = async (
  downloadLink: string,
  filename: string,
  dirName = ""
) => {
  // "Clean" filename by only allowing upper/lower chars, digits, and underscores
  const cleanFileName = getCleanFileName(filename.trimEnd());
  let documentDirectoryUri = FileSystem.documentDirectory + cleanFileName;

  try {
    const { exists } = await FileSystem.getInfoAsync(documentDirectoryUri);
    if (exists) {
      // file already exists, just return the name
      return { uri: documentDirectoryUri, cleanFileName };
    }
    const { uri } = await FileSystem.downloadAsync(downloadLink, documentDirectoryUri);
    // console.log("Download successful:", uri);
    return { uri, cleanFileName };
  } catch (e) {
    // console.log("Download NOT:", e);
    throw new Error(`error in downloadToFileSystem (image probably)-> ${e}`);
  }
};
export type DownloadProgress = {
  downloadProgress: number;
  bytesWritten: number;
  bytesExpected: number;
};
//!! react-native-blob-util TEST START
export const downloadFileBlob = async (
  downloadLink: string,
  filename: string,
  progress: (received, total) => void,
  audioSource: AudioSourceType
) => {
  let dirs = ReactNativeBlobUtil.fs.dirs;
  const cleanFileName = getCleanFileName(filename);
  // Need to use react-native-blob-utils documentDir.  rnblobUtil does NOT want the "file:///"
  // that FileSystem from expo provides.
  const fileUri = `${dirs.DocumentDir}/${cleanFileName}`;
  const isGoogle = audioSource === "google";
  const accessToken = isGoogle ? await getAccessToken() : undefined;
  const includeHeaders = isGoogle ? { Authorization: `Bearer ${accessToken}` } : {};

  const downloadUri = isGoogle
    ? `https://www.googleapis.com/drive/v3/files/${downloadLink}?alt=media`
    : downloadLink;

  let downloadTask: ReactNativeBlobUtil;

  const config = {
    path: fileUri,
  };

  const task = ReactNativeBlobUtil.config(config).fetch("GET", downloadUri, includeHeaders);
  const cancelDownload = async () => {
    await task.cancel();
  };

  // task.progress({ interval: 10 }, (received: number, total: number) => {
  //   progress(received, total);
  // });
  let lastUpdateTime = 0;
  const updateInterval = 100; // 500 milliseconds
  task.progress({ interval: 120 }, (received: number, total: number) => {
    const currentTime = Date.now();
    if (currentTime - lastUpdateTime >= updateInterval) {
      lastUpdateTime = currentTime;
      requestAnimationFrame(() => {
        progress(received, total);
      });
    }
  });

  return { task, cancelDownload, cleanFileName };
};

//!! react-native-blob-util TEST END
//~ ==========================================
//~ Download a file with Progress using
//~ react-native-fs
//~ Works for either Google or Dropbox
//~ ==========================================
// export const downloadFileWProgress = async (
//   downloadLink: string,
//   filename: string,
//   progress: (res: DownloadProgressCallbackResultT) => void,
//   audioSource: AudioSourceType
// ) => {
//   const cleanFileName = getCleanFileName(filename);
//   const fileUri = `${FileSystem.documentDirectory}${cleanFileName}`;
//   const isGoogle = audioSource === "google";
//   const accessToken = isGoogle ? await getAccessToken() : undefined;
//   const includeHeaders = isGoogle ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};
//   const downloadUri = isGoogle
//     ? `https://www.googleapis.com/drive/v3/files/${downloadLink}?alt=media`
//     : downloadLink;

//   try {
//     const res = downloadFile({
//       fromUrl: downloadUri,
//       toFile: fileUri,
//       ...includeHeaders,
//       begin: (dl) => {},
//       progress: progress,
//       progressInterval: 100,
//       progressDivider: 10,
//       discretionary: true,
//     });

//     const stopDownload = () => stopDownloadrnfs(res.jobId);
//     const startDownload = async () => await res.promise;
//     return { cleanFileName, stopDownload, startDownload };
//   } catch (err) {
//     console.log("downloadDropboxFile ERR --> ", err.code);
//   }
// };

//! -------------------------------------------------
//! Download all EXPERIMENT
//! -------------------------------------------------
// export const startDownloadAll = async (
//   files: FileEntry[],
//   progressUpdater: React.Dispatch<React.SetStateAction<string[]>>,
//   setProgress
// ) => {
//   console.log("files", files.length);
//   let dlLinks = [];

//   for (const file of files) {
//     const downloadLink = await getDropboxFileLink(file.path_lower);

//     //const res = await downloadToFileSystem(downloadLink, file.name);
//     const { startDownload, pauseDownload } = downloadWithProgress(
//       downloadLink,
//       file.name,
//       setProgress
//     );
//     const { cleanFileName, fileURI } = await startDownload();
//     useTracksStore.getState().actions.addNewTrack(
//       //res.cleanFileName,
//       cleanFileName,
//       file.name,
//       file.path_lower,
//       uuid.v4() as string
//     );
//     dlLinks.push(downloadLink);

//     progressUpdater((prev) => [...(prev || []), file.id]);
//   }

//   console.log("DONE");
// };

//! -------------------------------------------------
//! -------------------------------------------------
//--============================================================
//-- File Or Directory
//--============================================================
export const fileOrDirectory = async (fullPath: string) => {
  const { exists, isDirectory } = await FileSystem.getInfoAsync(fullPath);
  return { exists, isDirectory };
};

// Clean the filename.  Replace any non word chars or . with an underscore
// and if the last char is an underscore, remove it.
export const getCleanFileName = (filename: string) =>
  filename.replace(/[^\w.]+/g, "_").replace(/_$/, "");
