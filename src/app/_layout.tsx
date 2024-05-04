import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import {
  Slot,
  SplashScreen,
  useRouter,
  useRootNavigationState,
  usePathname,
  useLocalSearchParams,
} from "expo-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { View, useColorScheme } from "react-native";
import { Lato_100Thin, Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";

import TrackPlayer, { Capability, IOSCategoryMode } from "react-native-track-player";
import { onInitialize } from "../store/store-init";
import { useSettingStore } from "../store/store-settings";
import { usePlaybackStore, useTracksStore } from "../store/store";
import { deactivateKeepAwake } from "expo-keep-awake";
import { Orientation, lockPlatformAsync } from "expo-screen-orientation";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  laabMetaAggrRecurse,
  laabMetaAggrRecurseBegin,
  useDropboxStore,
} from "@store/store-dropbox";
import { useQuickActionCallback } from "expo-quick-actions/hooks";
import * as QuickActions from "expo-quick-actions";

let isTPSetup = false;
export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    Lato_100Thin,
    Lato_400Regular,
    Lato_700Bold,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // useQuickActionCallback(async (action) => {
  //   // ! NOTE: when in dev mode and you reload without quitting app, TrackPlayer STAYS SETUP, but isTPSetup gets set to false.
  //   console.log("ACTION", action);
  //   // while (!isTPSetup) {
  //   //   await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for 100ms
  //   // }
  //   const playlistId = action.params.playlistId as string;

  //   await usePlaybackStore.getState().actions.setCurrentPlaylist(playlistId);
  //   await usePlaybackStore.getState().actions.play();
  //   //! Setting the playlist search param AFTER setting the current playlist.
  //   //! This is useful when in the track player and a Quick Action is used.
  //   router.setParams({ playlistId });
  // });
  //--------
  // Zustand Store and app initialization
  //--------
  useEffect(() => {
    const setupTP = async () => {
      await onInitialize();

      const jumpForwardSeconds = useSettingStore.getState().jumpForwardSeconds;
      const jumpBackwardSeconds = useSettingStore.getState().jumpBackwardSeconds;

      // Try and keep track player from being set up twise
      try {
        if (!isTPSetup) {
          await TrackPlayer.setupPlayer({
            iosCategoryMode: IOSCategoryMode.SpokenAudio,
          });
          isTPSetup = true;
        }
      } catch (e) {
        console.log("Error setting up TrackPlayer");
      }
      await TrackPlayer.updateOptions({
        alwaysPauseOnInterruption: true,
        progressUpdateEventInterval: 1,
        forwardJumpInterval: jumpForwardSeconds,
        backwardJumpInterval: jumpBackwardSeconds,
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
          Capability.JumpBackward,
          Capability.JumpForward,
          Capability.Bookmark,
        ],
      });
      // console.log("TrackPlayer SETUP and onInitialize");
      // This allows the phone to go into sleep mode.  RNTP seems
      // to keep the phone awake when open.
      await deactivateKeepAwake();
      await lockPlatformAsync({ screenOrientationArrayIOS: [Orientation.PORTRAIT_UP] });
      setIsLoaded(true);
      // Auto check and load the LAABMetaAggr....json files if enabled.
      if (useDropboxStore.getState().laabMetaAggrControls.enabled) {
        const metaAggrFolders = useDropboxStore.getState().laabMetaAggrControls.folders;
        for (const metaFolder of metaAggrFolders) {
          // Force to run on startup
          await laabMetaAggrRecurseBegin(metaFolder, undefined, true);
        }
      }

      await useTracksStore.getState().actions.updateQuickActionsList();
    };

    // Run your initialization code here
    // It can be async
    setupTP();
  }, []);

  //!! Quick Actions Try
  useEffect(() => {
    const subscription = QuickActions.addListener(async (action) => {
      console.log(action.title);
      // while (!isTPSetup) {
      //   await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for 100ms
      // }
      const playlistId = action.params.playlistId as string;

      await usePlaybackStore.getState().actions.setCurrentPlaylist(playlistId);
      await usePlaybackStore.getState().actions.play();
      //! Setting the playlist search param AFTER setting the current playlist.
      //! This is useful when in the track player and a Quick Action is used.
      router.setParams({ playlistId });
    });
    return () => {
      console.log("Removing QA Sub");
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isLoaded && loaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded, loaded]);

  if (!isLoaded || !loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Slot />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
