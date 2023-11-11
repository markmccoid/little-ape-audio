import { View, Text, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { Link, Stack } from "expo-router";
import AddBook from "../../components/common/svg/AddBook";
import Monkey from "../../components/common/svg/Monkey";
import { SettingsIcon } from "../../components/common/svg/Icons";
import { colors } from "../../constants/Colors";
import useSleepTimer from "@components/common/sleepTimer/useSleepTimer";
import { useSettingStore } from "@store/store-settings";
import { useCurrentPlaylist } from "@store/store";
import { pl } from "date-fns/locale";
import { chooseTextColor } from "@utils/otherUtils";

const AudioLayout = () => {
  const countdownActive = useSettingStore((state) => state.countdownActive);
  // const playlist = useCurrentPlaylist();
  // const [bgColors, setBGColors] = useState({
  //   bg: colors.amber200,
  //   bgTimerActive: "#feb9b9",
  //   tint: colors.amber950,
  // });

  // useEffect(() => {
  //   console.log("IN USEEFFECT", playlist?.imageColors);
  //   if (playlist?.imageColors) {
  //     const textColor = chooseTextColor(playlist.imageColors.secondary);
  //     setBGColors({
  //       bg: playlist.imageColors.secondary,
  //       bgTimerActive: "#feb9b9",
  //       tint: textColor === "white" ? "white" : colors.amber950,
  //     });
  //   }
  // }, [playlist]);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: countdownActive ? "#feb9b9" : colors.amber200,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Audio Books",
          // headerStyle: { backgroundColor: colors.amber200 },
          headerTintColor: colors.amber950,
          headerRight: () => {
            return (
              <Link href="/audio/dropbox" asChild>
                <Pressable className="p-[10] mr-[-10]">
                  <AddBook size={25} />
                </Pressable>
              </Link>
            );
          },
          headerLeft: () => {
            return (
              <Link href="/settings" asChild replace>
                <Pressable className="p-[10] ml-[-10]">
                  <Monkey size={25} />
                </Pressable>
              </Link>
            );
          },
        }}
      />
      <Stack.Screen
        name="player"
        options={{
          headerShown: true,
          // headerStyle: {
          //   backgroundColor: countdownActive ? "#feb9b9" : bgColors.bg,
          // },
          // headerTintColor: bgColors.tint,
          // headerRight: () => (
          //   <Link href="/audio/playersettings" asChild>
          //     <Pressable className="p-[10] mr-[-10]">
          //       <SettingsIcon size={25} />
          //     </Pressable>
          //   </Link>
          // ),
        }}
      />
      <Stack.Screen
        name="playersettings"
        options={{
          presentation: "modal",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="dropbox"
        options={{
          title: "Dropbox",
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="playlistedit"
        options={{
          title: "Edit Playlist",
          presentation: "modal",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="externalLink"
        options={{
          title: "overwrite",
          presentation: "card",
        }}
      />
    </Stack>
  );
};

export default AudioLayout;
