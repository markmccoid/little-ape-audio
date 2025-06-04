import React from "react";
import { View, Text, TouchableOpacity, useWindowDimensions, SafeAreaView } from "react-native";
import { useNavigation, usePathname, useRouter, useSegments } from "expo-router";
import { ChevronBackIcon } from "../common/svg/Icons";
import { useDropboxStore } from "@store/store-dropbox";
import { colors } from "@constants/Colors";

function CustomHeader({ title, backText, sessionAudioSource }) {
  const navigation = useNavigation();
  const router = useRouter();
  const pathname = usePathname();
  const { width, height } = useWindowDimensions();

  // Use folderNavigation info stored in dropbox store to navigate back
  // Expo router 4 broke the goBack for dynamic paths like this [newdir], however
  // I've added the `getId={({ params }) => params.newdir}`
  // Be aware this has been depricated in expo router 5.  Looks like it works without, but test
  const onNavigateBack = () => {
    //const newPathInfo = actions.popFolderNavigation();
    // if (!newPathInfo) {
    navigation.goBack();
    // router.push(backPath);

    return;
    //   }
    // router.push({
    //   pathname: `/(audio)/dropbox/${newPathInfo.backTitle}`,
    //   params: {
    //     fullPath: newPathInfo.fullPath,
    //     backTitle: newPathInfo.backTitle,
    //     audioSource: newPathInfo.audioSource,
    //     yOffset: newPathInfo?.yOffset || 0,
    //   },
    // });
  };

  const audioSourceColor =
    sessionAudioSource === "dropbox"
      ? colors.dropboxBlue
      : sessionAudioSource === "abs"
      ? colors.absHeaderBg
      : colors.amber300;
  return (
    <SafeAreaView
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: audioSourceColor,
      }}
      className="h-12 border-b border-b-black "
    >
      <TouchableOpacity onPress={onNavigateBack}>
        <View className="flex-row items-center flex-1 ">
          <ChevronBackIcon size={30} color={sessionAudioSource === "dropbox" ? "white" : "black"} />
          <Text
            className={`text-lg ${
              sessionAudioSource === "dropbox" ? "text-white" : "text-amber-950"
            }`}
            style={{ width: width / 1.25 }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {backText || "Back"}
          </Text>
        </View>
      </TouchableOpacity>
      {/* <Text style={{ fontWeight: "bold", fontSize: 18 }}>{title}</Text> */}
    </SafeAreaView>
  );
}

export default CustomHeader;
function goBackInPath(path: string, delimiter: string = "/") {
  const lastSlash = path.lastIndexOf(delimiter);
  if (lastSlash < 0) {
    return "";
  }
  return path.slice(0, lastSlash);
}
