import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Slot, useRouter, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useLayoutEffect, useState } from "react";
import { Linking, View, useColorScheme } from "react-native";
import { Lato_100Thin, Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";

import TrackPlayer, { Capability, IOSCategoryMode } from "react-native-track-player";
import { checkMigration, onInitialize } from "../store/store-init";
import { useSettingStore } from "../store/store-settings";

import { deactivateKeepAwake } from "expo-keep-awake";
import { Orientation, lockPlatformAsync } from "expo-screen-orientation";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { laabMetaAggrRecurseBegin, useDropboxStore } from "@store/store-dropbox";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
configureReanimatedLogger({
  level: ReanimatedLogLevel.error,
  strict: false,
});
SplashScreen.preventAutoHideAsync();
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
    };

    // Run your initialization code here
    // It can be async
    setupTP();
  }, []);

  useEffect(() => {
    const handleInitialURL = async () => {
      if (!isLoaded || !loaded) return;
      const initialUrl = await Linking.getInitialURL();
      // console.log("Initial URL", initialUrl);
      if (initialUrl) {
        // get a url object
        const url = new URL(initialUrl);
        const path = url.pathname;
        // console.log("URL", url.pathname);
        // if there are params grab them
        // should only be for google and dropbox
        const params = new URLSearchParams(url.search);
        const fullPath = params.get("fullPath");
        const backTitle = params.get("backTitle");
        const audioSource = params.get("audioSource");

        // If we don't start and the base route we have issues.
        router.replace("/");
        // The abs routes DON"T need the params, but they will be null and won't hurt so just pass them
        router.push({ pathname: path, params: { fullPath, backTitle, audioSource } });
        // }
      } else {
        // router.replace("/(audio)");
      }
    };

    handleInitialURL();
  }, [isLoaded, router, loaded]);

  useEffect(() => {
    if (isLoaded && loaded) {
      // console.log("LOADED");
      SplashScreen.hideAsync();
      // SplashScreen.hide();
    }
  }, [isLoaded, loaded]);

  if (!isLoaded || !loaded) {
    return null;
  }

  return <RootLayoutNav />;
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // --------            -Minutes-
      staleTime: 1000 * 60 * 10,
    },
  },
});
function RootLayoutNav() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Slot />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
