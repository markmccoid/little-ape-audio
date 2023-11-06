import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { FolderEntry } from "../../utils/dropboxUtils";
import {
  EmptyMDHeartIcon,
  FolderClosedIcon,
  MDHeartIcon,
  ReadIcon,
  StarFilledIcon,
  StarUnFilledIcon,
} from "../common/svg/Icons";
import {
  FolderMetadataDetails,
  createFolderMetadataKey,
  extractMetadataKeys,
  getSingleFolderMetadata,
  useDropboxStore,
  useFolderMeta,
} from "../../store/store-dropbox";
import { colors } from "../../constants/Colors";

import ExplorerFolderRow from "./ExplorerFolderRow";
import { MotiView } from "moti";
import { CleanBookMetadata } from "@utils/audiobookMetadata";
import { AudioSourceType } from "@app/audio/dropbox";

type Props = {
  folder: FolderEntry;
  index: number;
  onNavigateForward: (path: string, folderName: string) => void;
  displayFolderMetadata: boolean;
  onDownloadMetadata: (startingFolder: FolderEntry[]) => Promise<void>;
  hasMetadata: boolean;
  folderMetadata: CleanBookMetadata;
  audioSource: AudioSourceType;
};

const ExplorerFolder = ({
  folder,
  index,
  onNavigateForward,
  displayFolderMetadata,
  onDownloadMetadata,
  hasMetadata,
  // setShowMetadata,
  folderMetadata,
  audioSource,
}: Props) => {
  const [isFavorite, setIsFavorite] = useState(!!folder.favorited);
  const actions = useDropboxStore((state) => state.actions);
  const folderAttributes = useDropboxStore((state) => state.folderAttributes);

  const currFolderAttributes = useMemo(() => {
    const id = createFolderMetadataKey(folder?.path_lower);
    return folderAttributes?.find((el) => el.id === id);
  }, [folderAttributes]);
  const [metadataInfo, setMetadataInfo] = useState(folderMetadata);
  // const [folderAttributes, setFolderAttributes] = useState(folderAttributes);
  const [folderMetaState, setFolderMetaState] = useState<"on" | "off" | "loading">("off");

  // Using local state for passed in show flag and metadata
  // because we allow reload of metadata from a single row with
  // a long press
  useEffect(() => {
    // setFolderMetaState(showFolderMetadata);
    setMetadataInfo(folderMetadata);
  }, [displayFolderMetadata, folderMetadata]);
  const toggleStarredFolder = async () => {
    if (isFavorite) {
      setIsFavorite(false);
      await actions.removeFavorite(folder.path_lower);
    } else {
      setIsFavorite(true);
      const name = audioSource === "dropbox" ? folder.path_lower : folder.name;
      await actions.addFavorite(folder.path_lower, name, audioSource);
    }
  };

  //~ ----------------------------
  //~ Download Function
  //~ ----------------------------
  const downloadFolderMetadata = async () => {
    // Start download and parse
    setFolderMetaState("loading");
    const convertedMetadata = await getSingleFolderMetadata(folder);

    // Create the needed keys and store the data in the dropbox store
    const { pathToBookFolderKey, pathToFolderKey } = extractMetadataKeys(folder.path_lower);
    actions.mergeFoldersMetadata(pathToFolderKey, {
      [pathToBookFolderKey]: convertedMetadata,
    });

    // set local metadata
    setMetadataInfo(convertedMetadata);
    setFolderMetaState("on");
  };

  // isFav and isRead -> red
  // isRead only -> green
  // else black
  const folderColor = currFolderAttributes?.isFavorite
    ? "#991b1b"
    : currFolderAttributes?.isRead
    ? "green"
    : "#d97706";
  // isFav and isRead -> green
  // isFav only -> red
  // else black
  const textColor = currFolderAttributes?.isRead
    ? "green"
    : currFolderAttributes?.isFavorite
    ? "#991b1b"
    : "black";
  return (
    <View
      style={{
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.amber700,
        backgroundColor: index % 2 === 0 ? colors.amber100 : colors.amber50,
        flex: 1,
        paddingBottom: 5,
        height: !displayFolderMetadata ? 45 : displayFolderMetadata && hasMetadata ? 200 : 45,
        // height: showFolderMetadata === "off" || !hasMetadata ? 45  : 210,
      }}
    >
      <TouchableOpacity
        onPress={() => onNavigateForward(folder.path_lower, folder.name)}
        onLongPress={async () => await onDownloadMetadata([folder])}
        key={folder.id}
      >
        <MotiView
          key={`${displayFolderMetadata}-${metadataInfo?.id}`}
          from={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={
            {
              // loop:
              //   (displayFolderMetadata === "loading" && !metadataInfo) || folderMetaState === "loading"
              //     ? true
              //     : false,
              // type: "timing",
              // duration: 500,
            }
          }
          style={{
            flexDirection: "row",
            flexGrow: 1,
            alignItems: "center",
            paddingHorizontal: 8,
          }}
          // className={`${
          //   (showFolderMetadata === "loading" && !metadataInfo) || folderMetaState === "loading"
          //     ? "bg-amber-600"
          //     : ""
          // }`}
        >
          {currFolderAttributes?.isFavorite ? (
            <MDHeartIcon color={textColor} />
          ) : currFolderAttributes?.isRead ? (
            <ReadIcon color={folderColor} />
          ) : (
            <FolderClosedIcon
              color={folderColor}
              // style={{ backgroundColor: "#fca5a5" }}
            />
          )}
          <Text
            style={{ marginLeft: 10, flex: 1, color: textColor }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {folder.name}
          </Text>
          <TouchableOpacity
            className="border-l border-l-gray-400 pl-2 w-[35] py-2"
            onPress={toggleStarredFolder}
          >
            {isFavorite && <StarFilledIcon color="#74be73" />}
            {!isFavorite && <StarUnFilledIcon color="gray" />}
          </TouchableOpacity>
        </MotiView>
      </TouchableOpacity>
      <View className="mb-0 flex-1">
        <ExplorerFolderRow
          showMetadata={displayFolderMetadata}
          metadata={metadataInfo}
          index={index}
          key="data"
        />
      </View>
    </View>
  );
};

export default React.memo(ExplorerFolder);
