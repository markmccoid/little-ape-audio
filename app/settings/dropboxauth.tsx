import { View, Text, Dimensions } from "react-native";
import React from "react";
import DropboxAuth from "../../src/components/dropbox/DropboxAuth";
import { Stack, Link } from "expo-router";
import { HomeIcon } from "../../src/components/common/svg/Icons";
const { width, height } = Dimensions.get("window");

const DropboxAuthScreen = () => {
  return (
    <View className="flex-1 bg-amber-50" style={{ width }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link href="/audio">
              <HomeIcon />
            </Link>
          ),
        }}
      />
      <DropboxAuth />
    </View>
  );
};

export default DropboxAuthScreen;
