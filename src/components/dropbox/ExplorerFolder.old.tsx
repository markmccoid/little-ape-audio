import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  FolderEntry,
  downloadDropboxFile,
  listDropboxFiles,
} from "../../utils/dropboxUtils";
import {
  EmptyMDHeartIcon,
  FolderClosedIcon,
  MDHeartIcon,
} from "../common/svg/Icons";
import { useDropboxStore, useFolderMeta } from "../../store/store-dropbox";
import { colors } from "../../constants/Colors";
import { FolderMetadata, cleanOneBook } from "../../utils/audiobookMetadata";
import ExplorerFolderRow from "./ExplorerFolderRow";
import { MotiView } from "moti";
import { defaultImages } from "../../store/storeUtils";

type Props = {
  folder: FolderEntry;
  index: number;
  onNavigateForward: (path: string, folderName: string) => void;
  showFolderMetadata: "on" | "off" | "loading";
  folderMetadata: {};
  forceFlag: boolean;
};
const ExplorerFolder = ({
  folder,
  index,
  onNavigateForward,
  showFolderMetadata,
  folderMetadata,
  forceFlag = false,
}: Props) => {
  const [isFavorite, setIsFavorite] = useState(!!folder.favorited);
  const actions = useDropboxStore((state) => state.actions);
  const meta = useFolderMeta(folder.path_lower);
  // Stores Metadata info if requested
  const [metadataInfo, setMetadataInfo] = useState(folderMetadata);
  const [folderMetaState, setFolderMetaStata] = useState(showFolderMetadata);

  useEffect(() => {
    if (showFolderMetadata !== "off") {
      setMetadataInfo(meta);
    }
  }, [meta, showFolderMetadata]);

  const setFavorite = async () => {
    if (isFavorite) {
      setIsFavorite(false);
      await actions.removeFavorite(folder.path_lower);
    } else {
      setIsFavorite(true);
      await actions.addFavorite(folder.path_lower);
    }
  };

  //~ ----------------------------
  //~ Download Function
  //~ ----------------------------
  const downloadFolderMetadata = async () => {
    // Start download and parse
    setFolderMetaStata("loading");
    setMetadataInfo(undefined);
    const dropboxFolder = await listDropboxFiles(folder.path_lower);
    const metadataFile = dropboxFolder.files.find(
      (entry) => entry.name.includes("metadata") && entry.name.endsWith(".json")
    );

    if (metadataFile) {
      let convertedMeta;
      // console.log("PATH", metadataFile?.path_lower);

      const metadata = (await downloadDropboxFile(
        `${metadataFile.path_lower}`
      )) as FolderMetadata;
      convertedMeta = cleanOneBook(metadata);

      //! Cache in zustand store (store-dropbox)
      setMetadataInfo(convertedMeta);
      await actions.addFoldersMetadata({ [folder.path_lower]: convertedMeta });
    } else {
      // This means we did NOT find any ...metadata.json file build minimal info
      const partialMeta = {
        id: folder.path_lower,
        title: folder.name,
        imageURL: defaultImages.image10,
      };
      await actions.addFoldersMetadata({ [folder.path_lower]: partialMeta });
      setMetadataInfo(partialMeta);
    }
    setFolderMetaStata("on");
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
        <MotiView
          key={`${showFolderMetadata}-${metadataInfo?.id}`}
          from={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            loop:
              showFolderMetadata === "loading" && !metadataInfo ? true : false,
            type: "timing",
            duration: 500,
          }}
          style={{
            flexDirection: "row",
            flexGrow: 1,
            alignItems: "center",
            paddingHorizontal: 8,
          }}
          className={`${
            showFolderMetadata === "loading" && !metadataInfo
              ? "bg-amber-600"
              : ""
          }`}
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
        </MotiView>
      </TouchableOpacity>
      {folderMetaState !== "off" ? (
        <ExplorerFolderRow metadata={metadataInfo} index={index} />
      ) : (
        <ExplorerFolderRow metadata={undefined} index={index} />
      )}
    </View>
  );
};

export default ExplorerFolder;
