import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState } from "react";
import { FolderEntry } from "../../utils/dropboxUtils";
import {
  BookmarkIcon,
  EmptyMDHeartIcon,
  FolderClosedIcon,
  MDHeartIcon,
} from "../common/svg/Icons";
import { useDropboxStore } from "../../store/store-dropbox";

type Props = {
  folder: FolderEntry;
  onNavigateForward: (path: string, folderName: string) => void;
};
const ExplorerFolder = ({ folder, onNavigateForward }: Props) => {
  const [isFavorite, setIsFavorite] = useState(!!folder.favorited);
  const actions = useDropboxStore((state) => state.actions);

  const setFavorite = async () => {
    if (isFavorite) {
      setIsFavorite(false);
      await actions.removeFavorite(folder.path_lower);
    } else {
      setIsFavorite(true);
      await actions.addFavorite(folder.path_lower);
    }
  };
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderWidth: StyleSheet.hairlineWidth,
      }}
    >
      <TouchableOpacity
        onPress={() => onNavigateForward(folder.path_lower, folder.name)}
        key={folder.id}
      >
        <View
          style={{ flexDirection: "row", flexGrow: 1, alignItems: "center" }}
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
            className="border-l border-l-gray-400 pl-2 w-[35]"
            onPress={setFavorite}
          >
            {isFavorite && <MDHeartIcon color="#74be73" />}
            {!isFavorite && <EmptyMDHeartIcon color="gray" />}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ExplorerFolder;
