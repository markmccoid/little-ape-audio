import { View, Text, Dimensions } from "react-native";
import React from "react";
import DropboxAuth from "../../components/dropbox/DropboxAuth";
import GoogleAuth from "../../components/dropbox/GoogleAuth";
import { Stack, Link } from "expo-router";
import { HomeIcon } from "../../components/common/svg/Icons";

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
      <GoogleAuth />
    </View>
  );
};

export default DropboxAuthScreen;
