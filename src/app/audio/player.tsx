import { Dimensions, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import TrackPlayerContainer from "@components/trackPlayer/TrackPlayerContainer";
import PlayerHeaderComponent from "@components/trackPlayer/PlayerRouteHeader";

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
          header: () => <PlayerHeaderComponent />,
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
