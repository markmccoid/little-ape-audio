import uuid from "react-native-uuid";
import { create } from "zustand";
import { saveToAsyncStorage } from "./data/asyncStorage";
import TrackPlayer from "react-native-track-player";
import { formatSeconds, timeBetween } from "@utils/formatUtils";
import { BottomSheetImpRef } from "@components/trackPlayer/bottomSheet/BottomSheetContainer";
import { CollectionItem } from "./types";
import { defaultCollections } from "./types";
//-- ==================================
//-- SETTINGS STORE
//-- ==================================

type SettingsState = {
  // Stores the forward/backware jump seconds
  jumpForwardSeconds: number;
  jumpBackwardSeconds: number;
  // Sleep Timer ----
  sleepTimeMinutes: number;
  sleepStartDateTime: Date;
  cancelSleepTimeout: () => void;
  countdownActive: boolean;
  intervalActive: boolean;
  sleepCountDown: {
    secondsLeft: number;
    formattedOutput: string;
  };
  cancelSleepInterval: () => void;
  // Sleep Timer END ----
  // You do not need to use .current when accessing info
  playerBottomSheetRef: BottomSheetImpRef;
  // Cloud services authorization status
  cloudAuth: {
    dropbox?: boolean;
    google?: boolean;
  };
  isUsingDynamicColors: boolean;
  showCollectionColorStrip: boolean;
  // Start playing playlist when playlist is selected
  autoPlay: boolean;
  // Id of the default collection
  defaultCollectionId: string;
  // Current collection being used for filter
  selectedCollection: CollectionItem;
  actions: {
    updateJumpForwardSeconds: (seconds: number) => Promise<void>;
    updateJumpBackwardSeconds: (seconds: number) => Promise<void>;
    updateSleepTime: (sleepTime: number) => Promise<void>;
    startSleepTimer: () => void;
    stopSleepTimer: () => void;
    runSleepCountdown: () => void;
    setBottomSheetRef: (BottomSheetRef: BottomSheetImpRef) => void;
    setCloudAuth: (service: "dropbox" | "google", authStatus: boolean) => Promise<void>;
    toggleDynamicColors: () => Promise<void>;
    toggleAutoPlay: () => Promise<void>;
    toggleCollectionColorStrip: () => Promise<void>;
    setDefaultCollectionId: (collectionId: string) => Promise<void>;
    setSelectedCollection: (collection: CollectionItem) => Promise<void>;
  };
};
export const useSettingStore = create<SettingsState>((set, get) => ({
  jumpForwardSeconds: 15,
  jumpBackwardSeconds: 15,
  sleepTimeMinutes: 0,
  sleepStartDateTime: undefined,
  countdownActive: false,
  intervalActive: false,
  sleepCountDown: {
    secondsLeft: undefined,
    formattedOutput: "",
  },
  cancelSleepTimeout: undefined,
  cancelSleepInterval: undefined,
  playerBottomSheetRef: undefined,
  cloudAuth: {
    dropbox: false,
    google: false,
  },
  isUsingDynamicColors: true,
  showCollectionColorStrip: true,
  autoPlay: false,
  defaultCollectionId: "all",
  selectedCollection: defaultCollections[0],
  actions: {
    toggleDynamicColors: async () => {
      set({ isUsingDynamicColors: !get().isUsingDynamicColors });
      const newSettingsData = { ...get() };
      delete newSettingsData.actions;

      await saveToAsyncStorage("settings", newSettingsData);
    },
    toggleCollectionColorStrip: async () => {
      set({ showCollectionColorStrip: !get().showCollectionColorStrip });
      const newSettingsData = { ...get() };
      delete newSettingsData.actions;

      await saveToAsyncStorage("settings", newSettingsData);
    },
    toggleAutoPlay: async () => {
      set({ autoPlay: !get().autoPlay });
      const newSettingsData = { ...get() };
      delete newSettingsData.actions;

      await saveToAsyncStorage("settings", newSettingsData);
    },
    // CLOUD AUTH
    setCloudAuth: async (service, authStatus) => {
      set({ cloudAuth: { ...get().cloudAuth, [service]: authStatus } });
      const newSettingsData = { ...get() };
      delete newSettingsData.actions;

      await saveToAsyncStorage("settings", newSettingsData);
    },
    // BOTTOM SHEET REF
    setBottomSheetRef: (bottomSheetRef) => {
      set({ playerBottomSheetRef: bottomSheetRef });
    },
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
      if (sleepTime < 0) {
        sleepTime = 0;
      }
      sleepTime = Math.floor(sleepTime);
      set({ sleepTimeMinutes: sleepTime });
      const newSettingsData = { ...get() };
      delete newSettingsData.actions;
      // Save to settings store
      await saveToAsyncStorage("settings", newSettingsData);
    },
    startSleepTimer: () => {
      // If the cancelSleepTimeout is set then run it to clear
      // the old timeout
      if (get().cancelSleepTimeout) {
        get().cancelSleepTimeout();
      }

      set({
        countdownActive: true,
        sleepStartDateTime: new Date(),
        cancelSleepTimeout: undefined,
      });
      const sleepTime = get().sleepTimeMinutes * 60 * 1000;
      const cancelSleepTimeoutId = setTimeout(() => {
        TrackPlayer.pause();
        set({
          countdownActive: false,
          sleepStartDateTime: undefined,
          cancelSleepTimeout: undefined,
        });
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
      set({
        countdownActive: false,
        sleepStartDateTime: undefined,
        cancelSleepTimeout: undefined,
      });
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
        const sleepCountDown = formatSeconds(secondsLeft, "minimal", get().sleepTimeMinutes > 59);
        set({
          sleepCountDown: {
            secondsLeft,
            formattedOutput: sleepCountDown,
          },
        });
      }, 1000);

      set({
        intervalActive: true,
        cancelSleepInterval: () => {
          clearInterval(sleepInterval);
          set({
            intervalActive: false,
            sleepCountDown: {
              secondsLeft: undefined,
              formattedOutput: undefined,
            },
            cancelSleepInterval: undefined,
          });
        },
      });
    },
    setDefaultCollectionId: async (collectionId) => {
      set({ defaultCollectionId: collectionId });
      const newSettingsData = { ...get() };
      delete newSettingsData.actions;
      // Save to settings store
      await saveToAsyncStorage("settings", newSettingsData);
    },
    setSelectedCollection: async (collection) => {
      set({ selectedCollection: collection });
      const newSettingsData = { ...get() };
      delete newSettingsData.actions;
      // Save to settings store
      await saveToAsyncStorage("settings", newSettingsData);
    },
  },
}));
