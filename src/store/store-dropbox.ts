import uuid from "react-native-uuid";
import { create } from "zustand";
import { saveToAsyncStorage } from "./data/asyncStorage";
import {
  DropboxDir,
  FolderEntry,
  downloadDropboxFile,
  listDropboxFiles,
} from "../utils/dropboxUtils";
import {
  CleanBookMetadata,
  FolderMetadata,
  cleanOneBook,
} from "./../utils/audiobookMetadata";
import { defaultImages } from "./storeUtils";

//-- ==================================
//-- DROPBOX STORE
//-- ==================================
export type FavoriteFolders = {
  id: string;
  folderPath: string;
  // order position when displaying
  position: number;
};

type DropboxState = {
  favoriteFolders: FavoriteFolders[];
  folderMetadata: Record<string, Partial<CleanBookMetadata>>;
  actions: {
    addFavorite: (favPath: string) => Promise<void>;
    removeFavorite: (favPath: string) => Promise<void>;
    isFolderFavorited: (folders: FolderEntry[]) => FolderEntry[];
    updateFavFolderArray: (favFolders: FavoriteFolders[]) => void;
    // --  FOLDER METADATA ---
    addFolderMetadata: (
      newFolderMetadata: Partial<CleanBookMetadata>,
      path_lower: string
    ) => void;
    addFoldersMetadata: (
      newFoldersObj: Record<string, Partial<CleanBookMetadata>>
    ) => Promise<void>;
    getFolderMetadata: (path_lower: string) => Partial<CleanBookMetadata>;
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
    addFolderMetadata: (newFolderMetadata, path_lower) => {
      const currMetadata = get().folderMetadata;

      set({
        folderMetadata: { ...currMetadata, [path_lower]: newFolderMetadata },
      });
    },
    addFoldersMetadata: async (newFoldersObj) => {
      const folderMetadata = { ...get().folderMetadata, ...newFoldersObj };
      set((state) => ({
        folderMetadata,
      }));
      await saveToAsyncStorage("foldermetadata", folderMetadata);
    },
    getFolderMetadata: (path_lower: string) => {
      return get().folderMetadata?.[path_lower];
    },
  },
}));

export const useFolderMeta = (folderId) => {
  const currMeta = useDropboxStore.getState().folderMetadata;
  return currMeta?.[folderId];
};
//~ ----------------------------
//~ Download Function
//~ ----------------------------
export const downloadFolderMetadata = async (folders: FolderEntry[]) => {
  // If we already downloaded metadata do not do it again!
  let foldersToDownload = [];
  for (const folder of folders) {
    //! Check if we have metadata in zustand store
    const folderMetadata = useDropboxStore
      .getState()
      .actions.getFolderMetadata(folder.path_lower);
    if (!folderMetadata) {
      foldersToDownload.push(folder);
    }
  }

  if (foldersToDownload.length === 0) return;

  // console.log(`DOWNLOADING META - ${foldersToDownload.length} folders`);
  let chunkedFolders = [];
  // if (foldersToDownload.length > 80) {
  chunkedFolders = chunkArray(foldersToDownload, 2);
  // }
  const promises = chunkedFolders.map((chunk) => getArrayOfPromises(chunk));

  // console.log(`PROCESS ${promises.length} promises`);

  const delayedPromises = [];
  for (let i = 0; i < promises.length; i++) {
    delayedPromises.push(
      new Promise((resolve) =>
        setTimeout(() => {
          processPromises(promises[i]);
          resolve(undefined);
        }, i * 1200)
      )
    );
  }
  await Promise.all(delayedPromises);
};

export const getSingleFolderMetadata = async (folder) => {
  //! Since we didn't have it in the store, download it
  // Start download and parse
  const dropboxFolder = await listDropboxFiles(folder.path_lower);
  const metadataFile = dropboxFolder.files.find(
    (entry) => entry.name.includes("metadata") && entry.name.endsWith(".json")
  );

  let convertedMeta;
  if (metadataFile) {
    // console.log("PATH", metadataFile?.path_lower);
    const metadata = (await downloadDropboxFile(
      `${metadataFile.path_lower}`
    )) as FolderMetadata;
    convertedMeta = cleanOneBook(metadata);
  } else {
    // This means we did NOT find any ...metadata.json file build minimal info
    convertedMeta = {
      id: folder.path_lower,
      title: folder.name,
      imageURL: defaultImages.image11,
    };
  }
  return convertedMeta;
};

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

function getArrayOfPromises(arr: FolderEntry[]) {
  return arr.map(async (folder) => {
    const returnMeta = await getSingleFolderMetadata(folder);
    return { [folder.path_lower]: returnMeta };
  });
}

async function processPromises(promises) {
  const folderMetadataArray = await Promise.all(promises);
  const folderMetaObj = folderMetadataArray.reduce(
    (final, el) => ({ ...final, ...el }),
    {}
  );
  // console.log("in PROCESS PROMISES", folderMetadataArray.length);
  // Save to store
  await useDropboxStore.getState().actions.addFoldersMetadata(folderMetaObj);
}
