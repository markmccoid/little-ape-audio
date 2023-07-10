import uuid from "react-native-uuid";
import { create } from "zustand";
import { saveToAsyncStorage } from "./data/asyncStorage";
import {
  DropboxDir,
  FolderEntry,
  downloadDropboxFile,
  getDropboxFileLink,
  listDropboxFiles,
} from "../utils/dropboxUtils";
import {
  CleanBookMetadata,
  FolderMetadata,
  cleanOneBook,
} from "./../utils/audiobookMetadata";
import { defaultImages, getRandomNumber } from "./storeUtils";
import {
  downloadToFileSystem,
  getCleanFileName,
} from "./data/fileSystemAccess";
import { Alert } from "react-native";

//-- ==================================
//-- DROPBOX STORE
//-- ==================================
export type FavoriteFolders = {
  id: string;
  folderPath: string;
  // order position when displaying
  position: number;
};

export type FolderMetadataDetails = Partial<CleanBookMetadata> & {
  isFavorite?: boolean;
  isRead?: boolean;
};

type DropboxState = {
  favoriteFolders: FavoriteFolders[];
  folderMetadata: Record<string, FolderMetadataDetails>;
  actions: {
    addFavorite: (favPath: string) => Promise<void>;
    removeFavorite: (favPath: string) => Promise<void>;
    isFolderFavorited: (folders: FolderEntry[]) => FolderEntry[];
    updateFavFolderArray: (favFolders: FavoriteFolders[]) => void;
    // --  FOLDER METADATA ---
    addFolderMetadata: (
      newFolderMetadata: FolderMetadataDetails,
      path_lower: string,
      saveToStorage?: boolean
    ) => Promise<void>;
    addFoldersMetadata: (
      newFoldersObj: Record<string, FolderMetadataDetails>
    ) => Promise<void>;
    getFolderMetadata: (path_lower: string) => FolderMetadataDetails;
    clearFolderMetadata: () => Promise<void>;
  };
};
export const useDropboxStore = create<DropboxState>((set, get) => ({
  favoriteFolders: [],
  folderMetadata: {},
  actions: {
    addFavorite: async (favPath) => {
      const favs = [...(get().favoriteFolders || [])];
      const newFav: FavoriteFolders = {
        id: uuid.v4() as string,
        folderPath: favPath,
        position: favs.length + 1,
      };
      const updatedFolders = [...favs, newFav];
      set({ favoriteFolders: updatedFolders });
      saveToAsyncStorage("favfolders", updatedFolders);
    },
    removeFavorite: async (favPath) => {
      const currFavs = [...(get().favoriteFolders || [])];
      const updatedFavs = currFavs.filter((el) => el.folderPath !== favPath);
      set({ favoriteFolders: updatedFavs });
      saveToAsyncStorage("favfolders", updatedFavs);
    },
    updateFavFolderArray: (favFolders) => {
      set({ favoriteFolders: favFolders });
      saveToAsyncStorage("favfolders", favFolders);
    },
    isFolderFavorited: (folders) => {
      const currFavs = get().favoriteFolders || [];
      const sourceArray = currFavs.map((el) => el.folderPath);

      let taggedFolders = [];
      if (Array.isArray(folders)) {
        for (const source of folders) {
          const isFavorited = sourceArray.includes(source.path_lower);
          taggedFolders.push({ ...source, favorited: isFavorited });
        }
      }

      return taggedFolders as FolderEntry[];
    },
    addFolderMetadata: async (newFolderMetadata, path_lower) => {
      const currMetadata = get().folderMetadata;
      const metadataKey = createFolderMetadataKey(path_lower);

      const newData = { ...currMetadata[metadataKey], ...newFolderMetadata };

      const folderMetadata = { ...currMetadata, [metadataKey]: newData };
      set({ folderMetadata });
      // if (saveToStorage) {
      await saveToAsyncStorage("foldermetadata", folderMetadata);
      // }
    },
    addFoldersMetadata: async (newFoldersObj) => {
      const folderMetadata = { ...get().folderMetadata, ...newFoldersObj };
      set((state) => ({
        folderMetadata,
      }));
      await saveToAsyncStorage("foldermetadata", folderMetadata);
    },
    getFolderMetadata: (path_lower: string) => {
      const key = createFolderMetadataKey(path_lower);
      return get().folderMetadata?.[key];
    },
    clearFolderMetadata: async () => {
      set({ folderMetadata: {} });
      await saveToAsyncStorage("foldermetadata", {});
    },
  },
}));

export const useFolderMeta = (folderId) => {
  const currMeta = useDropboxStore.getState().folderMetadata;
  return currMeta?.[folderId];
};
//~ ===================================
//~ Download Function Metadata FUNCIONS
//~ ===================================
//~ downloadFolderMetadata
export const downloadFolderMetadata = async (folders: FolderEntry[]) => {
  // If we already downloaded metadata do not do it again!
  let foldersToDownload = [];
  const foldersMetadata = useDropboxStore.getState().folderMetadata;
  for (const folder of folders) {
    //! Check if we have metadata in zustand store
    const folderMetadata = foldersMetadata?.[folder.path_lower];
    if (!folderMetadata) {
      foldersToDownload.push(folder);
    }
  }
  // Bail there are no folders to download (i.e. they exist in the store)
  if (foldersToDownload.length === 0) return;
  // START DOWNLOAD
  let chunkedFolders = [];
  const CHUNK_SIZE = 10;
  chunkedFolders = chunkArray(foldersToDownload, CHUNK_SIZE);

  const promises = chunkedFolders.map((chunk) => getArrayOfPromises(chunk));

  const delayedPromises = [];
  for (let i = 0; i < promises.length; i++) {
    delayedPromises.push(
      new Promise(
        (resolve) =>
          setTimeout(() => {
            processPromises(promises[i]);
            resolve(undefined);
          }, i * 800 * CHUNK_SIZE) // Give each record in chunk 900 ms to process (keeps rate limit error from api at bay)
      )
    );
  }
  await Promise.all(delayedPromises);
};
//~ -------------------------
//~ downloadFolderMetadata
//~ -------------------------
export const getSingleFolderMetadata = async (folder) => {
  //! Since we didn't have it in the store, download it
  // Start download and parse
  const randomNum = getRandomNumber();
  const dropboxFolder = await listDropboxFiles(folder.path_lower);
  const metadataFile = dropboxFolder.files.find(
    (entry) => entry.name.includes("metadata") && entry.name.endsWith(".json")
  );
  // Look for local image file
  const localImage = dropboxFolder.files.find(
    (entry) => entry.name.endsWith(".jpg") || entry.name.endsWith(".png")
  );

  let finalCleanFileName = "";

  let convertedMeta;
  if (metadataFile) {
    try {
      const metadata = (await downloadDropboxFile(
        `${metadataFile.path_lower}`
      )) as FolderMetadata;
      //-- LOCAL IMAGE CHECK
      // Check to see if there is a google image, if not look for one it directory
      // Don't want to check every time, dropbox will throw 429 rate limit error
      if (!metadata.googleAPIData?.imageURL && localImage) {
        finalCleanFileName = await getLocalImage(localImage, folder.name);
      }
      convertedMeta = cleanOneBook(metadata, finalCleanFileName);
    } catch (error) {
      Alert.alert(
        "Error Downloading Metadata File",
        `Error downloading "${metadataFile.name}" with ${error.message}`
      );
    }
  } else {
    // This means we did NOT find any ...metadata.json file build minimal info
    if (localImage) {
      finalCleanFileName = await getLocalImage(localImage, folder.name);
    }
    convertedMeta = {
      id: folder.path_lower,
      title: folder.name,
      localImageName: finalCleanFileName,
      defaultImage: defaultImages[`image${randomNum}`],
    } as Partial<CleanBookMetadata>;
  }
  return convertedMeta;
};

//~===========================================
//~ GET LOCAL IMAGE --
//~===========================================
async function getLocalImage(localImage, folderName) {
  // Get extension
  const localImageExt = localImage.name.slice(localImage.name.length - 4);
  // Create full file name
  //NOTE: we are using the base folder name for the image name NOT the actual filename
  //    this is why we are tacking on the extension
  const localImageName = `localimages_${folderName}${localImageExt}`;
  // Get the dropbox link to image file
  const localImageURI = await getDropboxFileLink(`${localImage.path_lower}`);
  // Download and store the image locally
  const { uri, cleanFileName } = await downloadToFileSystem(
    localImageURI,
    localImageName
  );
  return cleanFileName;
}
//~ ------------------------------
//~ Chunk passed array into smaller arrays
//~ ------------------------------
function chunkArray(array: any[], chunkSize: number) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

//~===========================================
//~ getArrayOfPromises --
//~ Creates an array of promises with the getSingleFolderMetadata function
//~ We will be getting "chunks" as arrays of promises (default 10 at a time)
//~===========================================
function getArrayOfPromises(arr: FolderEntry[]) {
  return arr.map(async (folder) => {
    const returnMeta = await getSingleFolderMetadata(folder);

    const metadataKey = createFolderMetadataKey(folder.path_lower);
    return { [metadataKey]: returnMeta };
  });
}

//~===========================================
//~ processPromises --
//~ When called it resolves the promises and processes
//~ the return data. That data goes into folder Metadata object
//~ Lastly it stores that data to the Zustand store (and to async storage)
//~===========================================
/**
 *
 * [{
 *  "book_key": {
 *      id: "",
 *      title: "",
 *      other book metadata...
 *      Maybe-isFavorite
 *      Maybe-hasRead
 *    }
 * },
 *  ...
 * ]
 */
async function processPromises(promises) {
  const folderMetadataArray = await Promise.all(promises);
  // console.log("FMD", folderMetadataArray[0]);
  const currMetadata = useDropboxStore.getState().folderMetadata;
  const folderMetaObj = folderMetadataArray.reduce((final, el) => {
    const path_lower = Object.keys(el)[0];
    const metadataKey = createFolderMetadataKey(path_lower);
    const newData = { ...currMetadata[metadataKey], ...el[metadataKey] };

    return { ...final, [metadataKey]: newData };
  }, {});
  // console.log("in PROCESS PROMISES", folderMetadataArray.length);
  // Save to store
  await useDropboxStore.getState().actions.addFoldersMetadata(folderMetaObj);
}

//~ -------------------------
//~ createFolderMetadataKey
//~ -------------------------
export function createFolderMetadataKey(pathIn: string) {
  const pathArr = pathIn.split("/");
  let finalKey = [];
  for (var i = pathArr.length - 1; i >= pathArr.length - 2; i--) {
    if (pathArr[i]) {
      finalKey.push(getCleanFileName(pathArr[i]));
    }
  }
  return finalKey.reverse().join("_");
}
