import { Dimensions, View, Text, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { Link, Stack, useRouter } from "expo-router";
import { getCurrentPlaylist } from "../../store/store";
import TrackPlayerContainer from "@components/trackPlayer/TrackPlayerContainer";
import { colors } from "@constants/Colors";
import { chooseTextColor } from "@utils/otherUtils";
import { SettingsIcon } from "@components/common/svg/Icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import IOSBack from "@components/common/svg/IOSBack";
import { TouchableOpacity } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");

const PlaylistScreen = () => {
  return (
    <View className="flex-1 bg-amber-50">
      <Stack.Screen
        options={{
          // headerBackTitle: "Back",
          // headerStyle: {
          //   backgroundColor: bgColors.bg,
          // },
          // headerTintColor: bgColors.tint,
          header: () => <HeaderComponent />,
          // headerRight: () => (
          //   <Link href="/audio/playersettings" asChild>
          //     <Pressable className="p-[10] mr-[-10]">
          //       <SettingsIcon size={25} color={bgColors.tint} />
          //     </Pressable>
          //   </Link>
          // ),
          // headerTitle: () => (
          //   <View className="flex">
          //     <Text
          //       className="text-base font-bold text-amber-950 flex-1 text-center"
          //       style={{ width: width - 125, color: bgColors.tint }}
          //       numberOfLines={1}
          //       ellipsizeMode="tail"
          //     >
          //       {playlist?.name}
          //     </Text>
          //   </View>
          // ),
        }}
      />

      <TrackPlayerContainer />
    </View>
  );
};

export default PlaylistScreen;

const HeaderComponent = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const HEADERHEIGHT = insets.top + 44;
  const playlist = getCurrentPlaylist();
  const [bgColors, setBGColors] = useState({
    bg: colors.amber200,
    bgTimerActive: "#feb9b9",
    tint: colors.amber950,
  });

  useEffect(() => {
    if (playlist?.imageColors) {
      const textColor = chooseTextColor(playlist.imageColors.secondary);
      setBGColors({
        bg: playlist.imageColors.secondary,
        bgTimerActive: "#feb9b9",
        tint: textColor === "white" ? colors.amber100 : colors.amber950,
      });
    }
  }, [playlist]);
  return (
    <View
      className={`flex-row px-2 items-center justify-start`}
      style={{ backgroundColor: bgColors.bg, paddingTop: insets.top - 5 }}
    >
      <TouchableOpacity onPress={() => router.back()} className="flex-row items-center w-[25]">
        <IOSBack strokeColor={bgColors.tint} />
        {/* <Text
          className="text-lg font-semibold pl-2"
          style={{
            color: bgColors.tint,
          }}
        >
          Back
        </Text> */}
      </TouchableOpacity>
      <View className="flex-row flex-1 pl-3 pr-1 justify-center">
        <Text
          className="text-base font-bold text-amber-950 text-center"
          style={{ color: bgColors.tint }}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {playlist?.name}
        </Text>
      </View>
      <View className="">
        <Link href="/audio/playersettings" asChild>
          <Pressable className="p-[10] mr-[-10]">
            <SettingsIcon size={25} color={bgColors.tint} />
          </Pressable>
        </Link>
      </View>
    </View>
  );
};
