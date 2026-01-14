import { create } from "zustand";

type BookmarkModalData = {
  bookmarkId?: string;
  playlistId?: string;
  position?: number;
};

type UIState = {
  bookmarkModalVisible: boolean;
  bookmarkModalData: BookmarkModalData;
  actions: {
    openBookmarkModal: (data?: BookmarkModalData) => void;
    closeBookmarkModal: () => void;
  };
};

export const useUIStore = create<UIState>((set) => ({
  bookmarkModalVisible: false,
  bookmarkModalData: {},
  actions: {
    openBookmarkModal: (data = {}) => set({ bookmarkModalVisible: true, bookmarkModalData: data }),
    closeBookmarkModal: () => set({ bookmarkModalVisible: false, bookmarkModalData: {} }),
  },
}));

export const useUIActions = () => useUIStore((state) => state.actions);
