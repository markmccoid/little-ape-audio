import { View, Text, Dimensions, Pressable, ScrollView, KeyboardAvoidingView } from "react-native";
import React from "react";
import DropboxAuth from "../../components/dropbox/DropboxAuth";
import GoogleAuth from "../../components/dropbox/GoogleAuth";
import ABSAuth from "../../components/dropbox/AbsAuth";
import { Stack, Link } from "expo-router";
import { HomeIcon } from "../../components/common/svg/Icons";

const { width, height } = Dimensions.get("window");

const DropboxAuthScreen = () => {
  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1" keyboardVerticalOffset={95}>
      <ScrollView
        className="flex-1 bg-amber-50"
        style={{ width }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{}}
      >
        <Stack.Screen
          options={{
            headerRight: () => (
              <Link href="/(audio)">
                <HomeIcon />
              </Link>
            ),
          }}
        />

        <View className="flex-row m-2">
          <Link href="/(audio)/" asChild>
            <Pressable className="flex-grow w-full border bg-amber-300 rounded-md px-2 py-1">
              <Text className="text-lg text-center">Home</Text>
            </Pressable>
          </Link>
        </View>
        <DropboxAuth />
        <GoogleAuth />
        <ABSAuth />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default DropboxAuthScreen;
