import { colors } from "@constants/Colors";
import { getCurrentPlaylist } from "@store/store";
import React, { useState } from "react";

// Currently doesn't do much, but in the future, may need to process something??
const usePlaylistColors = () => {
  const currPlaylist = getCurrentPlaylist();
  const [playlistColors, setPlaylistColors] = useState();
  let currColors = currPlaylist.imageColors;
  if (!currPlaylist?.imageColors?.background?.color) {
    currColors = {
      background: {
        color: colors.amber600,
        colorType: "dark",
        // The color to use for text or items if background is the bg color.
        tintColor: colors.amber950,
        colorLuminance: 0,
      },
      primary: {
        color: colors.amber100,
        colorType: "light",
        // The color to use for text or items if primary is the bg color.
        tintColor: colors.amber950,
        colorLuminance: 0,
      },
      secondary: {
        color: colors.amber200,
        colorType: "light",
        // The color to use for text or items ifsecondary is the bg color.
        tintColor: colors.amber950,
        colorLuminance: 0,
      },
      detail: {
        color: colors.amber100,
        colorType: "light",
        // The color to use for text or items if detail is the bg color.
        tintColor: colors.amber950,
        colorLuminance: 0,
      },
    };
  }
  return currColors;
};

export default usePlaylistColors;
