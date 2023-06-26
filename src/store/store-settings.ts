import uuid from "react-native-uuid";
import { create } from "zustand";
import { saveToAsyncStorage } from "./data/asyncStorage";
import TrackPlayer from "react-native-track-player";

//-- ==================================
//-- SETTINGS STORE
//-- ==================================

type SettingsState = {
  jumpForwardSeconds: number;
  jumpBackwardSeconds: number;
  actions: {
    updateJumpForwardSeconds: (seconds: number) => Promise<void>;
    updateJumpBackwardSeconds: (seconds: number) => Promise<void>;
  };
};
export const useSettingStore = create<SettingsState>((set, get) => ({
  jumpForwardSeconds: 15,
  jumpBackwardSeconds: 15,
  actions: {
    updateJumpForwardSeconds: async (seconds) => {
      set({ jumpForwardSeconds: seconds });
      const newSettingsData = {
        jumpBackwardSeconds: useSettingStore.getState().jumpBackwardSeconds,
        jumpForwardSeconds: seconds,
      };
      await saveToAsyncStorage("settings", newSettingsData);
      // Update trackplayers interval.  This will update on the remote screen
      await TrackPlayer.updateOptions({
        forwardJumpInterval: seconds,
      });
    },
    updateJumpBackwardSeconds: async (seconds) => {
      set({ jumpBackwardSeconds: seconds });
      const newSettingsData = {
        jumpForwardSeconds: useSettingStore.getState().jumpForwardSeconds,
        jumpBackwardSeconds: seconds,
      };
      await saveToAsyncStorage("settings", newSettingsData);
      // Update trackplayers interval.  This will update on the remote screen
      await TrackPlayer.updateOptions({
        backwardJumpInterval: seconds,
      });
    },
  },
}));
