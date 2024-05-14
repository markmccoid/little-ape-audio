import { create } from "zustand";
import { saveToAsyncStorage } from "./data/asyncStorage";
import uuid from "react-native-uuid";
import { Library } from "./data/absTypes";

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
    storeUserInfo: (userInfo: UserInfo) => void;
    storeLibraries: (libraries: StoredLibraries[]) => void;
    setActiveLibraryId: (libraryId: string) => void;
  };
};

export const useABSStore = create<ABSState>((set, get) => ({
  userInfo: undefined,
  libraries: undefined,
  activeLibraryId: undefined,
  actions: {
    storeUserInfo: (userInfo) => {
      set({ userInfo });

      saveToAsyncStorage("absSettings", { userInfo, libraries: get().libraries });
    },
    storeLibraries: (libraries) => {
      set({ libraries });
      saveToAsyncStorage("absSettings", { userInfo: get().userInfo, libraries });
    },
    setActiveLibraryId: (libraryId) => {
      set({ activeLibraryId: libraryId });
      saveToAsyncStorage("absSettings", {
        userInfo: get().userInfo,
        libraries: get().libraries,
        activeLibraryId: libraryId,
      });
    },
  },
}));
