import uuid from "react-native-uuid";
import { create } from "zustand";
import { saveToAsyncStorage } from "./data/asyncStorage";
import TrackPlayer from "react-native-track-player";

//-- ==================================
//-- SETTINGS STORE
//-- ==================================

type SettingsState = {
  jumpForwardSeconds: number;
  actions: {
    updateJumpForwardSeconds: (seconds: number) => Promise<void>;
  };
};
export const useSettingStore = create<SettingsState>((set, get) => ({
  jumpForwardSeconds: 15,
  actions: {
    updateJumpForwardSeconds: async (seconds) => {
      set({ jumpForwardSeconds: seconds });
      await saveToAsyncStorage("settings", { jumpForwardSeconds: seconds });
      // Update trackplayers interval.  This will update on the remote screen
      await TrackPlayer.updateOptions({
        forwardJumpInterval: seconds,
      });
    },
  },
}));
