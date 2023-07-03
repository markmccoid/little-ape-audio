import { View, Image, StyleSheet, ImageStyle } from "react-native";
import React from "react";
import * as FileSystem from "expo-file-system";
import { colors } from "../../constants/Colors";
import { CleanBookMetadata } from "../../utils/audiobookMetadata";

const IMG_RATIO = 1.5;

type Props = {
  metadata: Partial<CleanBookMetadata>;
  width: number;
  style?: ImageStyle;
};
const ExplorerImage = ({ metadata, width, style }: Props) => {
  const imgDims = metadata.imageURL?.uri
    ? { width, height: width * IMG_RATIO }
    : { width, height: width };
  const finalImage = metadata?.imageURL
    ? metadata.imageURL
    : metadata?.localImageName
    ? { uri: `${FileSystem.documentDirectory}${metadata.localImageName}` }
    : metadata.defaultImage;

  return (
    <View>
      <Image
        source={finalImage}
        style={[
          {
            width: imgDims.width,
            height: imgDims.height,
            resizeMode: "stretch",
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.amber900,
            borderRadius: 10,
            marginLeft: 10,
          },
          style,
        ]}
      />
    </View>
  );
};

export default ExplorerImage;
