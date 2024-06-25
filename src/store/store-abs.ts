import { create } from "zustand";
import { saveToAsyncStorage } from "./data/asyncStorage";

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
  field: "author" | "title" | "addedAt" | "publishedYear" | "duration";
  direction: "asc" | "desc";
};
export type SearchObject = {
  author?: string;
  title?: string;
  // Combo search (look at both authors and titles)
  authorOrTitle?: string;
  description?: string;
  genres?: string[];
  tags?: string[];
};

export type ABSState = {
  userInfo?: UserInfo;
  libraries?: StoredLibraries[];
  activeLibraryId?: string;
  // This is the sort for the results in the absHooks.ts file functions
  resultSort: ResultSort;
  searchObject: SearchObject;
  // This is from a ref set in the ABSMainContainer.tsx
  clearSearchBar: () => void;
  actions: {
    saveUserInfo: (userInfo: UserInfo) => Promise<void>;
    saveLibraries: (libraries: StoredLibraries[], activeLibraryId: string) => Promise<void>;
    updateResultSort: (resultSort: ResultSort) => Promise<void>;
    updateSearchObject: (searchObject: ABSState["searchObject"] | undefined) => void;
    setSearchBarClearFn: (clearFn: () => void) => void;
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
  searchObject: {},
  clearSearchBar: () => {},
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
          searchObject: {},
        });

        await absSaveStore();
      }
    },
    updateResultSort: async (resultSort) => {
      set({ resultSort });

      await absSaveStore();
    },
    updateSearchObject: (searchObject) => {
      // console.log("SearchObject", searchObject);
      if (!searchObject) {
        set({ searchObject: {} });
        return;
      }
      for (const [key, value] of Object.entries(searchObject)) {
        if (typeof value === "string") {
          searchObject[key] = value.toLowerCase();
        } else {
          searchObject[key] = value;
        }
      }
      const currSearchObj = get().searchObject;
      set({ searchObject: { ...currSearchObj, ...searchObject } });
      //console.log("store-abs curr search", get().searchObject);
      // await absSaveStore();
    },
    setSearchBarClearFn: (searchFn) => {
      set({ clearSearchBar: searchFn });
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
  });
};
