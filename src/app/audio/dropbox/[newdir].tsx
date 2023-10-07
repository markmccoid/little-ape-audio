import { View, Text, SafeAreaView } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
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
  const { newdir, fullPath, backTitle, yOffset } = useLocalSearchParams<SearchParms>();
  const [prevDir, setPrevDir] = useState("");

  useEffect(() => {
    // console.log("PREV DIR", prevDir, newdir);
    if (prevDir !== newdir) {
      actions.pushFolderNavigation({ fullPath: fullPath || "/", backTitle });
    }
    setPrevDir(newdir);
  }, [newdir]);
  // console.log("NEWDIR-newdir", newdir);
  // console.log("NEWDIR-fulPath BackTitle", fullPath, backTitle);
  // Need a listener that will clear the dropbox store folderNavigation array
  // This is when the modal is dismissed
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
          header: () => <CustomHeader title={fullPath || "/"} backText={backTitle} />,
        }}
      />

      <ExplorerContainer
        pathIn={fullPath || "/"}
        onPathChange={onPathChange}
        yOffset={yOffset ? parseFloat(yOffset) : 0}
      />
    </SafeAreaView>
  );
};

export default NewDirectory;
