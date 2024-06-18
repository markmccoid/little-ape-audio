import { View, Image, Dimensions } from "react-native";
import React from "react";
import { AudioTrack, Playlist } from "@store/types";
import { resolveABSImage } from "@utils/otherUtils";

const { width, height } = Dimensions.get("window");
type Props = {
  playlist: Playlist;
  currentTrack: AudioTrack;
  compHeight?: number;
};
const TrackPlayerScrollerImage = ({ playlist, currentTrack, compHeight }: Props) => {
  const imageURI =
    playlist?.overrideTrackImage || !currentTrack?.metadata?.pictureURI
      ? resolveABSImage(playlist?.imageURI)
      : resolveABSImage(currentTrack?.metadata?.pictureURI);
  // console.log(
  //   "TrackPlayerScrollerImage",
  //   playlist?.imageURI?.slice(0, 30),
  //   currentTrack?.metadata?.pictureURI?.slice(0, 30)
  // );
  return (
    <View
      style={{
        backgroundColor: "white",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
        width: width / 1.35,
        height: width / 1.35,
        borderRadius: 20,
        alignSelf: "center",
        alignItems: "center",
      }}
    >
      <Image
        source={{ uri: imageURI }}
        style={{
          width: width / 1.35,
          height: width / 1.35,
          borderRadius: 20,
          // width: width - 100, //width / 1.35,
          // height: width - 100, // width / 1.35,
          resizeMode: "stretch",
          alignSelf: "center",
        }}
      />
    </View>
  );
};

export default TrackPlayerScrollerImage;
