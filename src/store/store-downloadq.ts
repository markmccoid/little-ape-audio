import { create } from "zustand";
import { usePlaybackStore, useTracksStore } from "./store";
import { getDropboxFileLink } from "@utils/dropboxUtils";
import { downloadFileWProgress } from "./data/fileSystemAccess";
import { AudioSourceType } from "@app/audio/dropbox";
import { DownloadProgressCallbackResult } from "react-native-fs";
import { beginAsyncEvent } from "react-native/Libraries/Performance/Systrace";

type DownloadItem = {
  fileId: string;
  playlistId: string;
  // downloading - activly being downloaded.  Can be stopped
  // adding - being added to a playlist. Can NOT be stopped
  processStatus: "downloading" | "adding";
  stopDownload: () => void;
  downloadProgress?: number;
  bytesExpected?: number;
  bytesWritten?: number;
};

export type DownloadQueueItem = {
  filePathLower: string;
  fileName: string;
  fileId: string;
  audioSource: AudioSourceType;
  pathIn: string;
  currFolderText: string;
  playlistId?: string;
};

type DownloadQState = {
  activeTasks: DownloadItem[];
  queue: DownloadQueueItem[];
  completedDownloads: string[];
  maxActiveDownloads: number;
  isDownloading: boolean;
  actions: {
    addToQueue: ({
      filePathLower,
      fileName,
      fileId,
      audioSource,
      pathIn,
      currFolderText,
      playlistId,
    }: DownloadQueueItem) => void;
    processQueue: () => Promise<void>;
    clearCompletedDownloads: () => void;
    // Had issue trying to stop in process downloads this will only clear the queue so no new downloads will process.
    stopAllDownloads: () => void;
  };
};

// Dummy processing function
// const processDownload = async (url) => {
//   console.log(`--Processing: ${url}`);
//   // Simulate processing time
//   await new Promise((resolve) => setTimeout(resolve, 3000));
//   console.log(`--Finished processing: ${url}`);
// };

export const useDownloadQStore = create<DownloadQState>((set, get) => ({
  queue: [],
  activeTasks: [],
  completedDownloads: [],
  maxActiveDownloads: 2,
  isDownloading: false,
  actions: {
    addToQueue: (downloadProps) => {
      // check to see if passed file in completed download, return if it is.
      if (get().completedDownloads.includes(downloadProps.fileId)) return;

      set((state) => ({ queue: [...state.queue, downloadProps], isDownloading: true }));
      get().actions.processQueue(); // Trigger processing after adding a new item
    },
    processQueue: async () => {
      const { queue, activeTasks } = get();
      // if the number of activeTasks that are "downloading" <= maxActiveDownloads AND there are items in the queue
      // then process the queue
      if (
        activeTasks.filter((el) => el.processStatus === "downloading").length <=
          get().maxActiveDownloads &&
        queue.length > 0
      ) {
        const queuedItem = queue[0];
        // Remove the item from the queue that is in queuedItem
        // remove any task with the same fileId if it exist in queue (it shouldn't) and add the new item as download
        // which we will do in the next line
        set((state) => ({
          queue: state.queue.slice(1),
          isDownloading: true,
          activeTasks: [
            ...state.activeTasks.filter((task) => task.fileId !== queuedItem.fileId),
            {
              fileId: queuedItem.fileId,
              playlistId: queuedItem.playlistId,
              processStatus: "downloading",
              stopDownload: () => {},
            },
          ],
        }));
        //!! -- Download file
        try {
          // downloadFile returns an Async function which calls the trackActions.AddNewTrac() function
          // We do this so that before calling this function and awaiting its return, we can run processQueue
          // again if needed.  This means we can start downloading the next file without waiting for AddNewTrack to finish.
          const addItemFunc = await downloadFile(queuedItem);

          // Continue processing if there are more items in the queue
          if (get().queue.length > 0) {
            get().actions.processQueue();
          } else if (get().activeTasks.length === 0) {
            set({ isDownloading: false });
          }
          // Call the addItemFunc which will call the trackActions.AddNewTrack() function returned from downloadFile()
          await addItemFunc();

          // We are done with this track, remove it from the activeTasks array and add it to the completedDownloads array
          set((state) => ({
            activeTasks: state.activeTasks.filter((task) => task.fileId !== queuedItem.fileId),
            completedDownloads: [...state.completedDownloads, queuedItem.fileId],
          }));
          // console.log("END Processing Queue", get().downloaded);
        } catch (err) {
          console.log("Error processing queue", err);
        }
        // We are using .then because await would stop the processing until downloadFile is done.
        // however, we need the code after the downloadFile call to run as it updates the store with needed info.
        // .then will queue a callback function to run when downloadFile is finished.
        // const task = downloadFile(queuedItem)
        //   .then(() => {
        //     // Continue processing if there are more items in the queue
        //     set((state) => ({
        //       activeTasks: state.activeTasks.filter((task) => task.fileId !== queuedItem.fileId),
        //       completedDownloads: [...state.completedDownloads, queuedItem.fileId],
        //     }));
        //     console.log("Processed: Active", queuedItem.fileName, get().activeTasks.length);
        //     // console.log("END Processing Queue", get().downloaded);
        //     if (get().queue.length > 0) {
        //       get().actions.processQueue();
        //     } else if (get().activeTasks.length === 0) {
        //       set({ isDownloading: false });
        //     }
        //   })
        //   .catch((err) => {
        //     console.log("Error processing queue", err);
        //   });
        // //!! -- downloadFile() then done

        // set((state) => ({
        //   activeTasks: [
        //     ...state.activeTasks,
        //     {
        //       fileId: queuedItem.fileId,
        //       playlistId: queuedItem.playlistId,
        //       processStatus: "downloading",
        //       stopDownload: () => {},
        //     },
        //   ],
        // }));
      }
    },
    clearCompletedDownloads: () => {
      set({ completedDownloads: [], isDownloading: false });
    },
    stopAllDownloads: () => {
      set({ queue: [] });
      // get().activeTasks.forEach((task) => {
      //   task.stopDownload();
      // });
      // set({ activeTasks: [], isDownloading: false });
    },
  },
}));

//~ --------------------------------------
//~ downloadFile
//~ --------------------------------------
const downloadFile = async (downloadProps: DownloadQueueItem) => {
  const { filePathLower, fileName, fileId, audioSource, pathIn, currFolderText, playlistId } =
    downloadProps;

  const trackActions = useTracksStore.getState().actions;
  const playlistLoaded = usePlaybackStore.getState().playlistLoaded;
  const resetPlaybackStore = usePlaybackStore.getState().actions.resetPlaybackStore;
  // setIsDownloading(true);
  // If playlist is loaded, reset store.  Needed because of how we pull chapter info
  // from the metadataChapterReceived event.
  if (playlistLoaded) {
    await resetPlaybackStore();
  }
  // Progress callback
  const onHandleProgress = (progressData: DownloadProgressCallbackResult) => {
    useDownloadQStore.setState((state) => ({
      activeTasks: state.activeTasks.map((task) => {
        if (task.fileId === fileId) {
          task.downloadProgress = progressData.bytesWritten / progressData.contentLength;
          task.bytesExpected = progressData.contentLength;
          task.bytesWritten = progressData.bytesWritten;
          return task;
        }
        return task;
      }),
    }));
  };

  // based on if google or dropbox
  const downloadLink = audioSource === "google" ? fileId : await getDropboxFileLink(filePathLower);
  // Prepare to start the download
  const { cleanFileName, stopDownload, startDownload } = await downloadFileWProgress(
    downloadLink,
    fileName,
    onHandleProgress,
    audioSource
  );

  //~ Function to stop the download and update the activeTasks array (remove the task/download item)
  const stopDownloading = () => {
    stopDownload();
    useDownloadQStore.setState((state) => ({
      activeTasks: state.activeTasks.filter((task) => task.fileId !== fileId),
      isDownloading: false,
    }));
  };
  // Add the stopDownloading function to the activeTasks array
  useDownloadQStore.setState((state) => ({
    activeTasks: state.activeTasks.map((task) => {
      if (task.fileId === fileId) {
        task.stopDownload = stopDownloading;
        return task;
      }
      return task;
    }),
  }));

  // Start the download
  try {
    const res = await startDownload();
  } catch (err) {
    throw err;
  }

  // Set task processStatus to adding (now we can't "stop" the process)
  useDownloadQStore.setState((state) => ({
    activeTasks: state.activeTasks.map((task) => {
      if (task.fileId === fileId) {
        task.processStatus = "adding";
        return task;
      }
      return task;
    }),
  }));
  return async () =>
    await trackActions.addNewTrack({
      fileURI: cleanFileName,
      filename: fileName,
      sourceLocation: filePathLower,
      playlistId: playlistId,
      pathIn,
      currFolderText,
      audioSource,
    });
  try {
    // Add new Track to store
    // console.log("Add New Track", fileName, cleanFileName);
    await trackActions.addNewTrack({
      fileURI: cleanFileName,
      filename: fileName,
      sourceLocation: filePathLower,
      playlistId: playlistId,
      pathIn,
      currFolderText,
      audioSource,
    });
  } catch (e) {
    console.log(`Error trackActions.addNewTrack for ${cleanFileName} `, e);
  }
};

export default useDownloadQStore;
