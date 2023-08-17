import uuid from "react-native-uuid";
import { create } from "zustand";
import { saveToAsyncStorage } from "./data/asyncStorage";
import TrackPlayer from "react-native-track-player";
import { formatSeconds, timeBetween } from "@utils/formatUtils";

//-- ==================================
//-- SETTINGS STORE
//-- ==================================

type SettingsState = {
  jumpForwardSeconds: number;
  jumpBackwardSeconds: number;
  sleepTimeMinutes: number;
  sleepStartDateTime: Date;
  cancelSleepTimeout: () => void;
  sleepCountDown: string;
  cancelSleepInterval: () => void;
  actions: {
    updateJumpForwardSeconds: (seconds: number) => Promise<void>;
    updateJumpBackwardSeconds: (seconds: number) => Promise<void>;
    updateSleepTime: (sleepTime: number) => Promise<void>;
    startSleepTimer: () => void;
    stopSleepTimer: () => void;
    runSleepCountdown: () => void;
  };
};
export const useSettingStore = create<SettingsState>((set, get) => ({
  jumpForwardSeconds: 15,
  jumpBackwardSeconds: 15,
  sleepTimeMinutes: 0,
  sleepStartDateTime: undefined,
  sleepCountDown: "",
  cancelSleepTimeout: undefined,
  cancelSleepInterval: undefined,
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
    startSleepTimer: () => {
      // If the cancelSleepTimeout is set then run it to clear
      // the old timeout
      if (get().cancelSleepTimeout) {
        get().cancelSleepTimeout();
      }

      set({ sleepStartDateTime: new Date(), cancelSleepTimeout: undefined });
      const sleepTime = get().sleepTimeMinutes * 60 * 1000;
      const cancelSleepTimeoutId = setTimeout(() => {
        TrackPlayer.pause();
        set({ sleepStartDateTime: undefined, cancelSleepTimeout: undefined });
        // stop the countdown if active
        if (get().cancelSleepInterval) {
          get().cancelSleepInterval();
        }
        console.log("Sleep Timer Done");
      }, sleepTime);
      // Set function to cancel timeout if needed
      set({ cancelSleepTimeout: () => clearTimeout(cancelSleepTimeoutId) });
    },
    stopSleepTimer: () => {
      // If the cancelSleepTimeout is set then run it to clear
      // the old timeout
      if (get().cancelSleepTimeout) {
        get().cancelSleepTimeout();
      }
      // stop the countdown if active
      if (get().cancelSleepInterval) {
        get().cancelSleepInterval();
      }
      // clear the sleep timer fields that indicate a sleep timer is active
      set({ sleepStartDateTime: undefined, cancelSleepTimeout: undefined });
    },
    runSleepCountdown: () => {
      // Clear interval if it exists
      if (get().cancelSleepInterval) {
        get().cancelSleepInterval();
      }
      const sleepInterval = setInterval(() => {
        const { secondsBetween, minutesInt, secondsInt } = timeBetween(
          new Date(),
          get().sleepStartDateTime
        );
        // We want to show the seconds left (i.e. countdown)
        const secondsLeft = get().sleepTimeMinutes * 60 - secondsBetween;
        const sleepCountDown = formatSeconds(
          secondsLeft,
          "minimal",
          get().sleepTimeMinutes > 59
        );
        set({ sleepCountDown });
      }, 1000);

      set({
        cancelSleepInterval: () => {
          clearInterval(sleepInterval);
          set({
            sleepCountDown: undefined,
            cancelSleepInterval: undefined,
          });
        },
      });
    },
  },
}));
