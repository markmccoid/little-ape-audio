import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { FolderEntry } from "../../utils/dropboxUtils";
import { FolderClosedIcon } from "../common/svg/Icons";

type Props = {
  folder: FolderEntry;
  onNavigateForward: (path: string, folderName: string) => void;
};
const ExplorerFolder = ({ folder, onNavigateForward }: Props) => {
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
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ExplorerFolder;
