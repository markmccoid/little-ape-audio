import { View, Text } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Link, Redirect, useRootNavigationState, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const RootIndex = () => {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => router.replace("/audio"), 1);
  }, []);
  return (
    <SafeAreaView>
      <Link href="/audio">
        <Text>START APP</Text>
      </Link>
    </SafeAreaView>
  );
};

export default RootIndex;
