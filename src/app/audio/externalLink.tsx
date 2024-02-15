import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Link, Stack, useRouter, useLocalSearchParams } from "expo-router";
import ExplorerAllContainer from "../../components/dropbox/ExplorerAllContainer";
import { useNavigation } from "expo-router";
import CustomHeader from "../../components/dropbox/CustomHeader";
import { useDropboxStore } from "@store/store-dropbox";
import { ChevronBackIcon } from "@components/common/svg/Icons";
import { AudioSourceLinkParams } from "./dropbox";

const ExternalLink = () => {
  const actions = useDropboxStore((state) => state.actions);
  const router = useRouter();
  const navigation = useNavigation();
  const { newdir, fullPath, backTitle, yOffset, audioSource, parentFolderId } =
    useLocalSearchParams<AudioSourceLinkParams>();
  const [prevDir, setPrevDir] = useState("");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "Book Recommendation",
          headerLeft: () => {
            return (
              <TouchableOpacity onPress={() => router.replace("/audio/")}>
                <View className="flex-row items-center  ml-[-15] pr-3">
                  <ChevronBackIcon size={25} />
                  <Text className="text-base font-semibold">Done</Text>
                </View>
              </TouchableOpacity>
            );
          },
        }}
      />

      <ExplorerAllContainer
        pathIn={fullPath || "/"}
        onPathChange={() => {}}
        yOffset={yOffset ? parseFloat(yOffset) : 0}
        audioSource={audioSource}
      />
    </SafeAreaView>
  );
};

export default ExternalLink;
