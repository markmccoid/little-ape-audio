import { View, Text } from "react-native";
import React from "react";
import { SymbolView } from "expo-symbols";
import { formatBytes } from "@utils/formatUtils";
import { EbookFile } from "@store/data/absTypes";

interface Props {
  ebookFile: EbookFile;
}
const ABSEBookRow = ({ ebookFile }: Props) => {
  return (
    <View className="flex-1 border-b bg-blue-200 flex-row items-center pl-2">
      <SymbolView name="book" size={20} tintColor="black" />
      <Text className="p-2 flex-1">{ebookFile.metadata.filename}</Text>
      <Text className="p-2 flex-1">{formatBytes(ebookFile.metadata.size)}</Text>
    </View>
  );
};

export default ABSEBookRow;
