import { View, Text, SafeAreaView } from "react-native";
import React, { useEffect, useLayoutEffect } from "react";
import { Link, Stack, useRouter, useLocalSearchParams } from "expo-router";
import ExplorerAllContainer from "@components/dropbox/ExplorerAllContainer";
import { useNavigation } from "expo-router";
import CustomHeader from "@components/dropbox/CustomHeader";
import { useDropboxStore } from "@store/store-dropbox";
import { AudioSourceLinkParams, AudioSourceType } from "@app/audio/dropbox";
import { customEncodeParens } from "@utils/otherUtils";

type SearchParms = { fullPath: string; backTitle: string; yOffset: string };

const NewDirectory = () => {
  const actions = useDropboxStore((state) => state.actions);
  const router = useRouter();
  const navigation = useNavigation();
  const { newdir, fullPath, backTitle, audioSource, yOffset, parentFolderId } =
    useLocalSearchParams<AudioSourceLinkParams>();

  const audioSourceIn = audioSource as AudioSourceType;
  useEffect(() => {
    actions.pushFolderNavigation({ fullPath, backTitle, audioSource: audioSourceIn });
  }, [newdir]);

  // Need a listener that will clear the dropbox store folderNavigation array
  // This is when the modal is dismissed
  navigation.addListener("beforeRemove", () => {
    actions.clearFolderNavigation();
  });

  const onPathChange = (newPath: string, folderName: string) => {
    // const trailingPath = newPath.slice(newPath.lastIndexOf("/") + 1);
    router.push({
      pathname: `/settings/${customEncodeParens(folderName)}`,
      params: {
        fullPath: customEncodeParens(newPath),
        backTitle: customEncodeParens(folderName),
        audioSource: audioSourceIn || "dropbox",
        parentFolderId: customEncodeParens(fullPath),
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* <Stack.Screen
        options={{
          headerBackTitleVisible: false,
          headerBackVisible: false,
          header: () => <CustomHeader title={fullPath} backText={backTitle} />,
        }}
      /> */}

      <ExplorerAllContainer
        pathIn={fullPath}
        onPathChange={onPathChange}
        yOffset={yOffset ? parseFloat(yOffset) : 0}
        audioSource={audioSourceIn || "dropbox"}
        parentFolderId={parentFolderId}
      />
    </SafeAreaView>
  );
};

export default NewDirectory;
