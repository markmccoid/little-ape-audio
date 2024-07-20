import { View, Text, SafeAreaView } from "react-native";
import React, { useEffect, useState } from "react";
import ABSMainContainer from "@components/dropbox/AudiobookShelf/ABSMainContainer";
import { useABSStore } from "@store/store-abs";
import { Stack } from "expo-router";
import { useDropboxStore } from "@store/store-dropbox";
import { useQuery } from "@tanstack/react-query";

const audiobookshelf = () => {
  const updateSearchObject = useABSStore((state) => state.actions.updateSearchObject);
  const initABSFolderAttribiutes = useDropboxStore(
    (state) => state.actions.initABSFolderAttribiutes
  );
  // No data returned, we are reading Favorite and Read(isFinsihed) attributes
  // from ABS database and syncing with our folderAttributes object in store-dropbox
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["initABSFavorites"],
    queryFn: async () => await initABSFolderAttribiutes(),
    staleTime: 120 * 1000, // 120 seconds
  });

  useEffect(() => {
    // clear searchObject in abs store upon closing
    return () => updateSearchObject(undefined);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-abs-100">
      <ABSMainContainer />
    </SafeAreaView>
  );
};

export default audiobookshelf;
