import uuid from "react-native-uuid";
import { create } from "zustand";
import { saveToAsyncStorage } from "./data/asyncStorage";
import { FolderEntry } from "../utils/dropboxUtils";
import { CleanBookMetadata } from "./../utils/audiobookMetadata";

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
    getFolderMetadata: (path_lower: string) => {
      return get().folderMetadata?.[path_lower];
    },
  },
}));
