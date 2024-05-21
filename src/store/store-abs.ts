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
type ABSState = {
  userInfo?: UserInfo;
  libraries?: StoredLibraries[];
  activeLibraryId?: string;
  actions: {
    saveUserInfo: (userInfo: UserInfo) => void;
    saveLibraries: (libraries: StoredLibraries[], activeLibraryId: string) => void;
  };
};

export const useABSStore = create<ABSState>((set, get) => ({
  userInfo: undefined,
  libraries: undefined,
  activeLibraryId: undefined,
  actions: {
    saveUserInfo: async (userInfo) => {
      set({ userInfo });

      await saveToAsyncStorage("absSettings", {
        userInfo,
        libraries: get().libraries,
        activeLibraryId: get().activeLibraryId,
      });
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
        await saveToAsyncStorage("absSettings", {
          userInfo: get().userInfo,
          libraries: finalLibs,
          activeLibraryId,
        });
      }
    },
  },
}));
