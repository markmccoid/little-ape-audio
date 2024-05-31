import { View, Text } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Link, Redirect, useRootNavigationState, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetAllABSBooks } from "@store/data/absHooks";

const RootIndex = () => {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => router.replace("/audio"), 1);
  }, []);

  // Prefetch all books on startup
  const allbooks = useGetAllABSBooks();

  return (
    <SafeAreaView>
      <Link href="/audio">
        <Text></Text>
      </Link>
    </SafeAreaView>
  );
};

export default RootIndex;
