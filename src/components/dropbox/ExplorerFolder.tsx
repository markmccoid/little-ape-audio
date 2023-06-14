import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import React, { useEffect, useState } from "react";
import {
  FolderEntry,
  downloadDropboxFile,
  listDropboxFiles,
} from "../../utils/dropboxUtils";
import {
  BookmarkIcon,
  EmptyMDHeartIcon,
  FolderClosedIcon,
  InfoIcon,
  MDHeartIcon,
} from "../common/svg/Icons";
import { useDropboxStore } from "../../store/store-dropbox";
import Colors, { colors } from "../../constants/Colors";
import { FolderMetadata, cleanOneBook } from "../../utils/audiobookMetadata";
import ExplorerFolderRow from "./ExplorerFolderRow";
import { MotiView } from "moti";

type Props = {
  folder: FolderEntry;
  index: number;
  onNavigateForward: (path: string, folderName: string) => void;
  downloadMetadata: boolean;
};
const ExplorerFolder = ({
  folder,
  index,
  onNavigateForward,
  downloadMetadata,
}: Props) => {
  const [isFavorite, setIsFavorite] = useState(!!folder.favorited);
  const actions = useDropboxStore((state) => state.actions);
  // Stores Metadata info if requested
  const [metadataInfo, setMetadataInfo] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const setFavorite = async () => {
    if (isFavorite) {
      setIsFavorite(false);
      await actions.removeFavorite(folder.path_lower);
    } else {
      setIsFavorite(true);
      await actions.addFavorite(folder.path_lower);
    }
  };

  useEffect(() => {
    console.log("download metadata");
    if (downloadMetadata) {
      downloadFolderMetadata();
    }
  }, [downloadMetadata]);
  const downloadFolderMetadata = async () => {
    // If we already downloaded metadata do not do it again!
    if (metadataInfo) return;
    // Start download and parse
    setIsLoading(true);
    const dropboxFolder = await listDropboxFiles(folder.path_lower);
    const metadataFile = dropboxFolder.files.find(
      (entry) => entry.name.includes("metadata") && entry.name.endsWith(".json")
    );

    if (metadataFile) {
      console.log("PATH", metadataFile?.path_lower);
      const metadata = (await downloadDropboxFile(
        `${metadataFile.path_lower}`
      )) as FolderMetadata;
      const convertedMeta = cleanOneBook(metadata);

      // console.log(
      //   metadata?.folderNameData?.author,
      //   metadata?.folderNameData?.title,
      //   metadata?.googleAPIData?.imageURL
      // );
      setMetadataInfo(convertedMeta);
    } else {
      setMetadataInfo(undefined);
    }
    setIsLoading(false);
  };
  return (
    <View
      style={{
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.amber700,
        backgroundColor: index % 2 === 0 ? colors.amber100 : colors.amber50,
        flex: 1,
      }}
    >
      <TouchableOpacity
        onPress={() => onNavigateForward(folder.path_lower, folder.name)}
        onLongPress={downloadFolderMetadata}
        key={folder.id}
      >
        <View
          style={{
            flexDirection: "row",
            flexGrow: 1,
            alignItems: "center",
            paddingHorizontal: 8,
          }}
          className={`${isLoading && !metadataInfo ? "bg-amber-600" : ""}`}
        >
          <FolderClosedIcon color="#d97706" />
          <Text
            style={{ marginLeft: 10, flex: 1 }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {folder.name}
          </Text>
          <TouchableOpacity
            className="border-l border-l-gray-400 pl-2 w-[35] py-2"
            onPress={setFavorite}
          >
            {isFavorite && <MDHeartIcon color="#74be73" />}
            {!isFavorite && <EmptyMDHeartIcon color="gray" />}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      <ExplorerFolderRow metadata={metadataInfo} index={index} />
    </View>
  );
};

export default ExplorerFolder;
