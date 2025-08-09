import { create } from "zustand";
import { saveToAsyncStorage } from "./data/asyncStorage";
import { btoa } from "react-native-quick-base64";
import { AudiobookshelfAuth } from "../components/dropbox/AudiobookShelf/ABSAuthentication/absAuthClass";
import { AudiobookshelfAPI } from "../components/dropbox/AudiobookShelf/ABSAuthentication/absAPInew";

// Type for storing auth instances directly
export type AuthInstances = {
  auth: AudiobookshelfAuth;
  api: AudiobookshelfAPI;
};

export type UserInfo = {
  id: string;
  username: string;
  email: string;
  type: string;
  absURL: string;
  // base64 of <username>-laab-favorite
  favoriteSearchString?: string;
  // Remove token - authentication is now handled by the client
  isAuthenticated?: boolean;
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
  favorites?: "only" | "exclude" | undefined;
  isRead?: "only" | "exclude" | undefined;
};

export type ABSState = {
  userInfo?: UserInfo;
  libraries?: StoredLibraries[];
  activeLibraryId?: string;
  // Authentication instances
  authClient?: AuthInstances;
  // This is the sort for the results in the absHooks.ts file functions
  resultSort: ResultSort;
  searchObject: SearchObject;
  // This is from a ref set in the ABSMainContainer.tsx
  clearSearchBar: () => void;
  actions: {
    saveUserInfo: (userInfo: Partial<UserInfo>) => Promise<void>;
    saveLibraries: (libraries: StoredLibraries[], activeLibraryId: string) => Promise<void>;
    updateResultSort: (resultSort: ResultSort) => Promise<void>;
    updateSearchObject: (searchObject: ABSState["searchObject"] | undefined) => void;
    setSearchBarClearFn: (clearFn: () => void) => void;
    // New authentication actions
    setAuthClient: (authInstances: AuthInstances | undefined) => void;
    initializeAuth: () => Promise<boolean>;
    logout: () => Promise<void>;
  };
};

export const getAbsURL = () => {
  return useABSStore.getState()?.userInfo?.absURL;
};

// Helper function to get the authenticated client
export const getAuthClient = () => {
  return useABSStore.getState()?.authClient;
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return useABSStore.getState()?.userInfo?.isAuthenticated ?? false;
};

export const useABSStore = create<ABSState>((set, get) => ({
  userInfo: undefined,
  libraries: undefined,
  activeLibraryId: undefined,
  authClient: undefined,
  resultSort: {
    field: "author",
    direction: "desc",
  },
  searchObject: {},
  clearSearchBar: () => {},
  actions: {
    saveUserInfo: async (userInfo) => {
      const currUserInfo = get().userInfo;
      const favoriteSearchString = userInfo?.username
        ? btoa(`${userInfo.username}-laab-favorite`)
        : undefined;
      set({ userInfo: { ...currUserInfo, ...userInfo, favoriteSearchString } });

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
    // New authentication actions
    setAuthClient: (authInstances) => {
      set({ authClient: authInstances });
    },
    initializeAuth: async () => {
      const { userInfo } = get();
      if (!userInfo?.absURL) {
        return false;
      }

      try {
        // Create auth instances
        const auth = new AudiobookshelfAuth(userInfo.absURL);
        const api = new AudiobookshelfAPI(userInfo.absURL, auth);
        const authInstances: AuthInstances = { auth, api };

        // Check if user is authenticated (this will try to refresh tokens if needed)
        const isAuthenticated = await auth.isAuthenticated();

        if (isAuthenticated) {
          set({
            authClient: authInstances,
            userInfo: { ...userInfo, isAuthenticated: true },
          });
          return true;
        } else {
          set({
            authClient: undefined,
            userInfo: { ...userInfo, isAuthenticated: false },
          });
          return false;
        }
      } catch (error) {
        console.error("Failed to initialize authentication:", error);
        set({
          authClient: undefined,
          userInfo: userInfo ? { ...userInfo, isAuthenticated: false } : undefined,
        });
        return false;
      }
    },
    logout: async () => {
      const { authClient } = get();
      const { userInfo } = get();

      try {
        if (authClient) {
          await authClient.auth.logout();
        }
      } catch (error) {
        console.error("Logout error:", error);
      }

      // Clear authentication state
      const userInfoKeep = "absURL";
      const userInfoWorking = { ...userInfo };
      Object.keys(userInfo).forEach((key) => {
        if (key !== userInfoKeep) delete userInfoWorking[key];
      });
      set({
        authClient: undefined,
        userInfo: { ...userInfoWorking, isAuthenticated: false },
        libraries: undefined,
        activeLibraryId: undefined,
        searchObject: {},
      });

      // Clear stored data
      await saveToAsyncStorage("absSettings", {
        userInfo: { ...userInfoWorking, isAuthenticated: false },
        libraries: undefined,
        activeLibraryId: undefined,
        resultSort: get().resultSort,
      });
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

// Create a global variable that can be imported and used to
// access the APIs for ABS
// Create a proxy that forwards all calls to the actual client when it's ready
// export const absAPIClient: AudiobookshelfAPI = new Proxy(
//   {},
//   {
//     get(target, prop) {
//       const actualClient = useABSStore.getState().authClient.api;
//       if (!actualClient) {
//         throw new Error("API client not yet loaded");
//         // Or return a promise, or queue the call, etc.
//       }
//       const value = actualClient[prop as keyof AudiobookshelfAPI];

//       // Bind methods to preserve 'this' context
//       if (typeof value === "function") {
//         return value.bind(actualClient);
//       }
//       return value;
//     },
//   }
// ) as AudiobookshelfAPI;
export const absAPIClient: AudiobookshelfAPI = new Proxy(
  {},
  Object.freeze({
    get(_: unknown, prop: keyof AudiobookshelfAPI, receiver: unknown) {
      const actualClient = useABSStore.getState().authClient.api;
      if (!actualClient) {
        throw new Error("API client not yet loaded");
      }
      const value = Reflect.get(actualClient, prop, receiver);
      return typeof value === "function" ? value.bind(actualClient) : value;
    },
  })
) as AudiobookshelfAPI;
