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
  sleepTimeMinutes: number;
  sleepStartDateTime: Date;
  actions: {
    updateJumpForwardSeconds: (seconds: number) => Promise<void>;
    updateJumpBackwardSeconds: (seconds: number) => Promise<void>;
    updateSleepTime: (sleepTime: number) => Promise<void>;
  };
};
export const useSettingStore = create<SettingsState>((set, get) => ({
  jumpForwardSeconds: 15,
  jumpBackwardSeconds: 15,
  sleepTimeMinutes: 0,
  sleepStartDateTime: undefined,
  actions: {
    updateJumpForwardSeconds: async (seconds) => {
      set({ jumpForwardSeconds: seconds });

      const newSettingsData = { ...get() };
      delete newSettingsData.actions;

      await saveToAsyncStorage("settings", newSettingsData);
      // Update trackplayers interval.  This will update on the remote screen
      await TrackPlayer.updateOptions({
        forwardJumpInterval: seconds,
      });
    },
    updateJumpBackwardSeconds: async (seconds) => {
      set({ jumpBackwardSeconds: seconds });

      const newSettingsData = { ...get() };
      delete newSettingsData.actions;

      await saveToAsyncStorage("settings", newSettingsData);
      // Update trackplayers interval.  This will update on the remote screen
      await TrackPlayer.updateOptions({
        backwardJumpInterval: seconds,
      });
    },
    updateSleepTime: async (sleepTime) => {
      set({ sleepTimeMinutes: sleepTime });
      const newSettingsData = { ...get() };
      delete newSettingsData.actions;
      await saveToAsyncStorage("settings", newSettingsData);
    },
  },
}));
