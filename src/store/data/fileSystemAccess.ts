import * as FileSystem from "expo-file-system";

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
  // console.log("FILES", filesInSystem, FileSystem.documentDirectory);
  return filesInSystem;
};
//--============================================================
//-- deleteFromFileSystem -
//--============================================================
export const deleteFromFileSystem = async (
  path?: string,
  includesDocDirectory = true
) => {
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
  const cleanFileName = filename.replace(/[^\w.]/g, "_");
  let documentDirectoryUri = FileSystem.documentDirectory + cleanFileName;
  const { uri } = await FileSystem.downloadAsync(
    downloadLink,
    documentDirectoryUri
  );
  return uri;
};
export type DownloadProgress = {
  downloadProgress: number;
  bytesWritten: number;
  bytesExpected: number;
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

  const progressCallback = (
    downloadProgress: FileSystem.DownloadProgressData
  ) => {
    const progress =
      downloadProgress.totalBytesWritten /
      downloadProgress.totalBytesExpectedToWrite;
    setProgress({
      downloadProgress: progress,
      bytesWritten: downloadProgress.totalBytesWritten,
      bytesExpected: downloadProgress.totalBytesExpectedToWrite,
    });
  };
  // Clean filename for storage in system
  const cleanFileName = filename.replace(/[^\w.]/g, "_");
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
//--============================================================
//-- File Or Directory
//--============================================================
export const fileOrDirectory = async (fullPath: string) => {
  const { exists, isDirectory } = await FileSystem.getInfoAsync(fullPath);
  return { exists, isDirectory };
};
