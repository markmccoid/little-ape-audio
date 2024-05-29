import { create } from "zustand";
import { saveToAsyncStorage } from "./data/asyncStorage";
import { AudioFile } from "./data/absTypes";
import { useTracksStore } from "./store";
import { buildFilePathLower } from "./data/absUtils";

export type UserInfo = {
  id: string;
  username: string;
  email: string;
  type: string;
  token: string;
  absURL: string;
};

export type StoredLibraries = {
  id: string;
  name: string;
  displayOrder: number;
  active: boolean;
};

export type ResultSort = {
  field: "author" | "title" | "dateAdded" | "dateModified" | "duration";
  direction: "asc" | "desc";
};
export type ABSState = {
  userInfo?: UserInfo;
  libraries?: StoredLibraries[];
  activeLibraryId?: string;
  // This is the sort for the results from useGetABSBooks()
  resultSort: ResultSort;
  searchObject: {
    searchField: "author" | "title" | "description" | undefined;
    searchValue: string;
  };
  actions: {
    saveUserInfo: (userInfo: UserInfo) => Promise<void>;
    saveLibraries: (libraries: StoredLibraries[], activeLibraryId: string) => Promise<void>;
    updateResultSort: (resultSort: ResultSort) => Promise<void>;
    updateSearchObject: (searchObject: ABSState["searchObject"]) => Promise<void>;
  };
};

export const useABSStore = create<ABSState>((set, get) => ({
  userInfo: undefined,
  libraries: undefined,
  activeLibraryId: undefined,
  resultSort: {
    field: "author",
    direction: "desc",
  },
  searchObject: {
    searchField: undefined,
    searchValue: "",
  },
  actions: {
    saveUserInfo: async (userInfo) => {
      set({ userInfo });

      await absSaveStore();
    },
    saveLibraries: async (libraries, activeLibraryId) => {
      if (!libraries) {
        set({
          libraries: undefined,
          activeLibraryId: undefined,
        });
        saveToAsyncStorage("absSettings", { userInfo: get().userInfo, libraries, activeLibraryId });
      } else {
        const finalLibs = libraries.map((lib) => ({ ...lib, active: lib.id === activeLibraryId }));
        set({
          libraries: finalLibs,
          activeLibraryId,
        });

        await absSaveStore();
      }
    },
    updateResultSort: async (resultSort) => {
      set({ resultSort });

      await absSaveStore();
    },
    updateSearchObject: async (searchObject) => {
      set({ searchObject });

      await absSaveStore();
    },
  },
}));

const absSaveStore = async () => {
  const absState = useABSStore.getState();
  await saveToAsyncStorage("absSettings", {
    userInfo: absState.userInfo,
    libraries: absState.libraries,
    activeLibraryId: absState.activeLibraryId,
    resultSort: absState.resultSort,
    searchObject: absState.searchObject,
  });
};

//~ -------------------------------
//~ Tag audiobookshelf Files as being already download
//~ -------------------------------
export const absTagFiles = (audioFiles: AudioFile[], bookId: string) => {
  const trackActions = useTracksStore.getState().actions;
  const absFiles = audioFiles.map((audioFile) => ({
    ...audioFile,
    path_lower: buildFilePathLower(bookId, audioFile.ino),
  }));

  //!!! DEEP CLONING of object may be issue, we may be losing the nested objects
  const taggedFiles = absIsTrackDownloaded(absFiles);

  // Tag folders as being favorited

  return taggedFiles;
};

type AFPlus = AudioFile & { path_lower: string };
//-- Check to see if passed tracks have been downloaded, if so tag with isDownload
const absIsTrackDownloaded = (tracksToCheck: AFPlus[]) => {
  const sourceArray = useTracksStore.getState().tracks.map((el) => el.sourceLocation);
  let taggedFiles = [];
  if (Array.isArray(tracksToCheck)) {
    for (const source of tracksToCheck) {
      const isDownloaded = sourceArray.includes(source.path_lower);
      taggedFiles.push({ ...source, alreadyDownload: isDownloaded });
    }
  }

  return taggedFiles as (AudioFile & { path_lower: string; alreadyDownload: boolean })[];
};
