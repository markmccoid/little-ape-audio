// import uuid from "react-native-uuid";
// import { useTracksStore } from "@store/store";
// import { FileEntry, getDropboxFileLink } from "@utils/dropboxUtils";
import * as FileSystem from "expo-file-system";
import rnfs, { DownloadProgressCallbackResult } from "react-native-fs";
import { AudioSourceType } from "@app/audio/dropbox";
import { getAccessToken } from "@utils/googleUtils";

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
    console.log(`Error Deleting ${path}`, e);
  }
};

//--============================================================
//-- downloadToFileSystem - Downloads the file to the dir apth specificed
//-- starting dir is FileSystem.documentDirectory
//--============================================================

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
    return { uri, cleanFileName };
  } catch (e) {
    throw new Error(`error in downloadToFileSystem (image probably)-> ${e}`);
  }
};
export type DownloadProgress = {
  downloadProgress: number;
  bytesWritten: number;
  bytesExpected: number;
};

//~ ==========================================
//~ Download a file with Progress using
//~ react-native-fs
//~ Works for either Google or Dropbox
//~ ==========================================
export const downloadFileWProgress = async (
  downloadLink: string,
  filename: string,
  progress: (res: DownloadProgressCallbackResult) => void,
  audioSource: AudioSourceType
) => {
  const cleanFileName = getCleanFileName(filename);
  const fileUri = `${FileSystem.documentDirectory}${cleanFileName}`;
  const isGoogle = audioSource === "google";
  const accessToken = isGoogle ? await getAccessToken() : undefined;
  const includeHeaders = isGoogle ? { headers: { Authorization: `Bearer ${accessToken}` } } : {};
  const downloadUri = isGoogle
    ? `https://www.googleapis.com/drive/v3/files/${downloadLink}?alt=media`
    : downloadLink;

  try {
    const res = rnfs.downloadFile({
      fromUrl: downloadUri,
      toFile: fileUri,
      ...includeHeaders,
      begin: (dl) => {},
      progress: progress,
      progressInterval: 100,
    });

    const stopDownload = () => rnfs.stopDownload(res.jobId);
    const startDownload = async () => await res.promise;
    return { cleanFileName, stopDownload, startDownload };
  } catch (err) {
    console.log("downloadDropboxFile ERR --> ", err.code);
  }
};
/**
 * USAGE: calling this function will return two async function
 * - startDownload - calling this returned function will start the download, updating the
 *      Progress by using the setProgress function that was passed as a parameter.
 *      return { fileURI: returnURI, cleanFileName }
 * - pauseDownload - Calling will pause the download, but note that the startDownload function will continue
 *      and rest of the code that happens after startDownload was called will finish. This means
 *      that in the application using these functions, you will need a "isStopped" variable or state
 *      to know when a download has been paused.
 *      currently, pause menas STOP as resume is not implemented yet.
 */

export const downloadWithProgress = (
  downloadLink: string,
  filename: string,
  setProgress: (progress: DownloadProgress) => void,
  dirName = ""
) => {
  let pauseData: FileSystem.DownloadPauseState;
  //~ INITIAL Setup of downloadResumable var

  const progressCallback = (downloadProgress: FileSystem.DownloadProgressData) => {
    const progress =
      downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
    setProgress({
      downloadProgress: progress,
      bytesWritten: downloadProgress.totalBytesWritten,
      bytesExpected: downloadProgress.totalBytesExpectedToWrite,
    });
  };
  // Clean filename for storage in system
  const cleanFileName = getCleanFileName(filename);
  // Create the downloadResumable object
  const downloadResumable = FileSystem.createDownloadResumable(
    downloadLink,
    FileSystem.documentDirectory + cleanFileName,
    {},
    progressCallback
  );

  //~ -- START DOWNLOAD Function--
  const startDownload = async () => {
    let returnURI = undefined;
    try {
      const returnData = await downloadResumable.downloadAsync();
      returnURI = returnData?.uri;
    } catch (e) {
      console.error(e);
    }
    return { fileURI: returnURI, cleanFileName };
  };

  //~ -- PAUSE / STOP DOWNLOAD  Function --
  const pauseDownload = async () => {
    pauseData = await downloadResumable.pauseAsync();
    return pauseData;
  };
  //~ -- RESUME Data not need so not implemented
  // const resumeDownload = async () => {
  //   if (!pauseData) {
  //     console.log("No pause data found");
  //     return;
  //   }
  //   downloadResumable = new FileSystem.DownloadResumable(
  //     url,
  //     fileUri,
  //     {},
  //     pauseData.resumeData
  //   );
  //   downloadResumable
  //     .downloadAsync()
  //     .then(() => console.log("Download complete"));
  // };

  return {
    startDownload,
    pauseDownload,
  };
};

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
