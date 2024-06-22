import { View, Image, StyleSheet, ImageStyle } from "react-native";
import React from "react";
import * as FileSystem from "expo-file-system";
import { colors } from "../../constants/Colors";
import { CleanBookMetadata } from "../../utils/audiobookMetadata";
import { getImageSize } from "@utils/audioUtils";

const IMG_RATIO = 1.5;

type Props = {
  metadata: Partial<CleanBookMetadata>;
  width: number;
  style?: ImageStyle;
};
const ExplorerImage = ({ metadata, width, style }: Props) => {
  const [imgDims, setImgDims] = React.useState({
    width: 100,
    height: 100,
    finalImage: undefined,
  });
  // const imgDims = metadata.imageURL?.uri
  //   ? { width, height: width * IMG_RATIO }
  //   : { width, height: width };
  React.useEffect(() => {
    const getImageDims = async () => {
      const finalImage = metadata?.imageURL
        ? metadata.imageURL.replace(/^http:\/\//, "https://")
        : metadata?.localImageName
        ? `${FileSystem.documentDirectory}${metadata.localImageName}`
        : metadata.defaultImage;
      let imgDims = { width: 100, height: 100 };
      if (finalImage) {
        const { aspectRatio } = await getImageSize(finalImage);
        if (aspectRatio) {
          imgDims = { width: 100, height: 100 / aspectRatio };
        }
      }
      setImgDims({ ...imgDims, finalImage });
    };
    getImageDims();
  }, []);

  if (!metadata || !imgDims.finalImage) {
    return null;
  }
  return (
    <View>
      <Image
        source={{ uri: imgDims.finalImage }}
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
