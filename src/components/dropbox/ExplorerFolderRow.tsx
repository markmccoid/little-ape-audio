import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import { CleanBookMetadata } from "../../utils/audiobookMetadata";
import { colors } from "../../constants/Colors";
import { AnimateHeight } from "../common/animations/AnimateHeight";
import { PowerIcon } from "../common/svg/Icons";
import { MotiText, MotiView } from "moti";

type Props = {
  metadata: CleanBookMetadata;
  showMetadata?: boolean;
  index: number;
};
const ExplorerFolderRow = ({
  metadata,
  showMetadata = false,
  index,
}: Props) => {
  const [showDescription, setShowDescription] = useState(false);
  // const [imgDims, setImgDims] = useState({ width: 0, height: 0 });
  // console.log("FOLDER ROW", showMetadata, !metadata);
  if (!metadata || !showMetadata) return null;

  const imgDims = metadata.imageURL?.uri
    ? { width: 100, height: 150 }
    : { width: 100, height: 100 };
  // React.useEffect(() => {
  //   const getDims = async () => {
  //     Image.getSize(
  //       metadata.imageURL?.uri,
  //       (width, height) => {
  //         const imgConversion = height / width;
  //         setImgDims({ width: 100, height: 100 * imgConversion });
  //       },
  //       () => setImgDims({ width: 100, height: 100 })
  //     );
  //   };
  //   getDims();
  // }, []);
  return (
    <View
      className="flex-1 flex-col "
      style={{
        backgroundColor: index % 2 === 0 ? colors.amber100 : colors.amber50,
      }}
    >
      <View className="flex-1 flex-row w-full justify-start">
        {/* **IMAGE** */}
        <Image
          source={metadata.imageURL}
          style={{
            width: imgDims.width,
            height: imgDims.height,
            resizeMode: "stretch",
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.amber900,
            borderRadius: 10,
            marginLeft: 10,
          }}
        />
        {/* **TITLE AUTHOR OTHER** */}
        <View
          className="flex flex-col pl-2 flex-grow"
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
              {`${metadata?.author ? `by ${metadata.author}` : ""}`}
            </Text>
          </View>

          <View>
            {/* **Book Length** */}
            {metadata?.bookLength && (
              <Text className="text-center">{metadata.bookLength}</Text>
            )}
            {/* **Pub Year** */}
            <Text className="text-center">{metadata?.publishedYear}</Text>
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
                  backgroundColor: showDescription
                    ? colors.amber600
                    : colors.amber400,
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
                    transform: [
                      { rotate: showDescription ? "180deg" : "0deg" },
                    ],
                  }}
                  className={`${
                    showDescription ? "text-amber-100" : "text-amber-900"
                  }`}
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

      <AnimateHeight
        hide={!showDescription}
        style={{ marginHorizontal: 5, flex: 1 }}
      >
        <Text>{metadata.description}</Text>
      </AnimateHeight>
    </View>
  );
};

export default ExplorerFolderRow;
