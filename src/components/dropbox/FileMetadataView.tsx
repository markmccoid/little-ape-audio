import {
  View,
  Text,
  TouchableOpacity,
  Share,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { CleanBookMetadata } from "../../utils/audiobookMetadata";
import { colors } from "../../constants/Colors";
import { AnimateHeight } from "../common/animations/AnimateHeight";
import {
  BookIcon,
  EmptyMDHeartIcon,
  MDHeartIcon,
  PowerIcon,
  ReadIcon,
  ShareIcon,
} from "../common/svg/Icons";
import { AnimatePresence, MotiText, MotiView } from "moti";
import ExplorerImage from "./ExplorerImage";
import {
  FolderMetadataDetails,
  createFolderMetadataKey,
  extractMetadataKeys,
  getSingleFolderMetadata,
  useDropboxStore,
} from "../../store/store-dropbox";
import * as Linking from "expo-linking";
// import * as Sharing from "expo-sharing";

type Props = {
  metadata: CleanBookMetadata;
  path_lower: string;
};
const FileMetadataView = ({ metadata, path_lower }: Props) => {
  const [showDescription, setShowDescription] = useState(false);
  const dropboxActions = useDropboxStore((state) => state.actions);
  const folderAttributes = useDropboxStore((state) => state.folderAttributes);
  const currFolderAttributes = useMemo(() => {
    const id = createFolderMetadataKey(path_lower);
    return folderAttributes?.find((el) => el.id === id);
  }, [folderAttributes]);

  // if (!metadata) return null;

  //!!! Create LINKING URL Example

  // console.log(
  //   Linking.createURL("audio/dropbox/linkTest", {
  //     queryParams: { fullPath: path_lower, backTitle: "BackT" },
  //   })
  // );
  //~ ----------------------------
  //~ Download Function
  //~ ----------------------------
  const downloadFolderMetadata = async () => {
    // Start download and parse

    const { pathToBookFolderKey, pathToFolderKey, bookFolderName } =
      extractMetadataKeys(path_lower);
    const convertedMetadata = await getSingleFolderMetadata({ path_lower, name: bookFolderName });

    // Create the needed keys and store the data in the dropbox store
    dropboxActions.mergeFoldersMetadata(pathToFolderKey, {
      [pathToBookFolderKey]: convertedMetadata,
    });
  };

  useEffect(() => {
    if (!metadata) {
      downloadFolderMetadata();
    }
  }, []);
  //!!! ====================

  const handleToggleFavorite = async () => {
    const action = !!currFolderAttributes?.isFavorite ? "remove" : "add";

    await dropboxActions.updateFolderAttribute(path_lower, "isFavorite", action);
  };

  const handleToggleRead = async () => {
    const action = !!currFolderAttributes?.isRead ? "remove" : "add";
    await dropboxActions.updateFolderAttribute(path_lower, "isRead", action);
  };

  return (
    <>
      {metadata && (
        <View
          className={`items-start flex-col justify-start border-b border-b-amber-900 pb-2 pt-2`}
          style={{
            backgroundColor: colors.amber100,
          }}
        >
          <View className="flex-grow flex-row w-full justify-start ">
            {/* **IMAGE** */}
            <ExplorerImage metadata={metadata} width={100} />

            {/* **TITLE AUTHOR OTHER** */}
            <View
              className="flex flex-col pl-2 flex-1"
              style={{
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.amber300,
              }}
            >
              <View className="flex flex-row">
                <Text
                  className="flex-1 text-base font-semibold text-center pr-2"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {metadata.title}
                </Text>
              </View>

              <View className="flex-row justify-center">
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  className="flex-1 text-sm font-medium text-center pr-2"
                >
                  by {metadata.author}
                </Text>
              </View>

              <View>
                {/* **Book Length** */}
                {metadata?.bookLength && <Text className="text-center">{metadata.bookLength}</Text>}
                {/* **Pub Year** */}
                <Text className="text-center">{metadata.publishedYear}</Text>
              </View>
              <View className="flex-row justify-center mt-4">
                <TouchableOpacity onPress={handleToggleFavorite}>
                  {currFolderAttributes?.isFavorite ? (
                    <MDHeartIcon color="red" size={30} />
                  ) : (
                    <EmptyMDHeartIcon size={30} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleToggleRead} className="ml-4">
                  {currFolderAttributes?.isRead ? (
                    <View>
                      <BookIcon color="green" size={30} />
                      <ReadIcon style={{ position: "absolute", top: 2, left: 5 }} size={20} />
                    </View>
                  ) : (
                    <BookIcon size={30} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    const shareLink = Linking.createURL("audio/dropbox/theLink", {
                      queryParams: { fullPath: path_lower, backTitle: "Audio Sources" },
                    });
                    try {
                      const res = await Share.share({
                        title: "Share Book",
                        message: `Share ${metadata.title}`,
                        url: shareLink,
                      });
                    } catch (e) {
                      Alert.alert("Error on Share->", e.message);
                    }
                  }}
                  className="ml-4"
                >
                  <ShareIcon />
                </TouchableOpacity>
              </View>

              {/* **Show DESCRIPTION Button** */}
              {metadata.description && (
                <Pressable
                  onPress={() => setShowDescription((prev) => !prev)}
                  className="flex-row justify-center"
                >
                  <MotiView
                    from={{ backgroundColor: colors.amber400, scale: 0.8 }}
                    animate={{
                      backgroundColor: showDescription ? colors.amber600 : colors.amber400,
                      scale: showDescription ? 1 : 0.8,
                    }}
                    className="flex-row items-center border border-amber-800 py-1 px-2 rounded-md"
                  >
                    <Text
                      className={`mr-2 font-bold ${
                        showDescription ? "text-white" : "text-amber-900"
                      }`}
                    >
                      {`${showDescription ? "Hide" : "Show"} Desc`}
                    </Text>
                    <MotiView
                      from={{ transform: [{ rotate: "0deg" }] }}
                      animate={{
                        transform: [{ rotate: showDescription ? "180deg" : "0deg" }],
                      }}
                      className={`${showDescription ? "text-amber-100" : "text-amber-900"}`}
                    >
                      <PowerIcon
                        size={20}
                        color={showDescription ? colors.amber100 : colors.amber900}
                      />
                    </MotiView>
                  </MotiView>
                </Pressable>
              )}
            </View>
          </View>
          {/* **DESCRIPTION** */}
          {/* <AnimatePresence> */}
          {showDescription && (
            <MotiView
              from={{ height: 0 }}
              animate={{ height: 200 }} //{{ height: showDescription ? 200 : 0 }}
              // exit={{ height: 0 }}
              className="h-[200] z-10 px-2"
            >
              <ScrollView style={{ overflow: "scroll" }}>
                <Text style={{ fontSize: 18 }}>{metadata.description}</Text>
              </ScrollView>
            </MotiView>
          )}
          {/* </AnimatePresence> */}
        </View>
      )}
    </>
  );
};

export default FileMetadataView;
