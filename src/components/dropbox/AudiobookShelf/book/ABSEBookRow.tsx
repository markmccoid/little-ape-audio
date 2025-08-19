import { View, Text, Pressable, ActivityIndicator } from "react-native";
import React from "react";
import { SymbolView } from "expo-symbols";
import { formatBytes } from "@utils/formatUtils";
import { EbookFile } from "@store/data/absTypes";
import { PDFIcon, EpubIcon, CloudDownloadIcon } from "@components/common/svg/Icons";
import { absAPIClient } from "@store/store-abs";
interface Props {
  bookId: string;
  ebookFile: EbookFile;
}
const ABSEBookRow = ({ ebookFile, bookId }: Props) => {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const isPDF = ebookFile.ebookFormat.includes("pdf");
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await absAPIClient.downloadEbook(bookId, ebookFile.ino, ebookFile.metadata.filename);
    } catch (error) {
      console.log("Error downloading ebook", error);
    } finally {
      setIsDownloading(false);
    }
  };
  return (
    <View className="flex-1 border-b bg-blue-50 flex-row items-center justify-between px-2 py-2">
      <View className="flex-row items-center flex-1">
        {isPDF ? <PDFIcon size={25} color="black" /> : <EpubIcon size={25} color="black" />}
        <Text
          className="ml-2 flex-1"
          numberOfLines={3}
          ellipsizeMode="tail"
          style={{ marginTop: 2 }}
        >
          {ebookFile.metadata.filename}
        </Text>
      </View>
      <View className="flex-row items-center ml-4">
        <Text className="text-right min-w-[60px] font-ssp_regular text-base mr-2">
          {formatBytes(ebookFile.metadata.size)}
        </Text>
        <Pressable onPress={handleDownload} disabled={isDownloading}>
          <CloudDownloadIcon
            size={25}
            color="#3E85EC"
            style={{ opacity: isDownloading ? 0.5 : 1 }}
          />
          {isDownloading && (
            <View className="absolute">
              <ActivityIndicator size="small" />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default ABSEBookRow;
