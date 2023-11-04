import {
  View,
  Text,
  // FlatList,
  Dimensions,
  TouchableOpacity,
  SectionList,
  Pressable,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import Animated, {
  interpolate,
  runOnJS,
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { FilesAndFolders, listGoogleDriveFiles, listGoogleFiles } from "@utils/googleUtils";
import { MimeTypes } from "@robinbobin/react-native-google-drive-api-wrapper";

//!! How to determine current chapter without looking at each chapter
//!!
//!!
//!!
//!!
//!!
const playarea = () => {
  const [filesAndFolder, setFilesAndFolder] = useState<FilesAndFolders>();

  const getFiles = async (folderId = undefined) => {
    // const filesAndFolder = await listGoogleFiles(folderId);
    const filesAndFolder = await listGoogleDriveFiles(folderId);
    setFilesAndFolder(filesAndFolder);
  };

  React.useEffect(() => {
    getFiles();
  }, []);

  return (
    <View>
      <Text>GDrive Testing</Text>
      {filesAndFolder?.folders.map((folder) => {
        return (
          <TouchableOpacity onPress={() => getFiles(folder.id)} key={folder.id}>
            <Text className="font-semibold text-lg" key={folder.id}>
              {folder.name}
            </Text>
          </TouchableOpacity>
        );
      })}
      {filesAndFolder?.files.map((file) => {
        let classT = "font-medium text-base text-amber-800";

        return (
          <View key={file.id}>
            <Text>{file.name}</Text>
          </View>
        );
      })}
    </View>
  );
};

export default playarea;
