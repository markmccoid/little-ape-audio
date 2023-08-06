import { View, Text, SafeAreaView } from "react-native";
import React, { useEffect, useLayoutEffect } from "react";
import { Link, Stack, useRouter, useLocalSearchParams } from "expo-router";
import ExplorerContainer from "../../../components/dropbox/ExplorerContainer";
import { useNavigation } from "expo-router";
import CustomHeader from "../../../components/dropbox/CustomHeader";
import { useDropboxStore } from "@store/store-dropbox";

type SearchParms = { fullPath: string; backTitle: string; yOffset: string };

const NewDirectory = () => {
  const actions = useDropboxStore((state) => state.actions);
  const router = useRouter();
  const navigation = useNavigation();
  const { newdir, fullPath, backTitle, yOffset } =
    useLocalSearchParams<SearchParms>();
  useEffect(() => {
    actions.pushFolderNavigation({ fullPath, backTitle });
  }, [newdir]);

  // Need a listener that will clear the dropbox store folderNavigation array
  navigation.addListener("beforeRemove", () => {
    actions.clearFolderNavigation();
  });

  const onPathChange = (newPath: string, folderName: string) => {
    // const trailingPath = newPath.slice(newPath.lastIndexOf("/") + 1);
    router.push({
      pathname: `/audio/dropbox/${folderName}`,
      params: {
        fullPath: newPath,
        backTitle: folderName,
      },
    });
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerBackTitleVisible: false,
          headerBackVisible: false,
          header: () => <CustomHeader title={fullPath} backText={backTitle} />,
        }}
      />

      <ExplorerContainer
        pathIn={fullPath}
        onPathChange={onPathChange}
        yOffset={yOffset}
      />
    </SafeAreaView>
  );
};

export default NewDirectory;
