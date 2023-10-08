import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import {
  Slot,
  SplashScreen,
  useRouter,
  useRootNavigationState,
  Redirect,
  useNavigation,
} from "expo-router";
import { useEffect, useState } from "react";
import { View, useColorScheme } from "react-native";
import { Lato_100Thin, Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";

import TrackPlayer, { Capability, IOSCategoryMode } from "react-native-track-player";
import { onInitialize } from "../store/store-init";
import { useSettingStore } from "../store/store-settings";
import { deactivateKeepAwake } from "expo-keep-awake";
import { Orientation, lockPlatformAsync } from "expo-screen-orientation";

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
  const rootNavState = useRootNavigationState();


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
      await TrackPlayer.setupPlayer({
        iosCategoryMode: IOSCategoryMode.SpokenAudio,
      });
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
    };
    // Run your initialization code here
    // It can be async
    setupTP();
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
    <>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </>
  );
}
