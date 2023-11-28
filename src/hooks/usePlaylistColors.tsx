import { colors } from "@constants/Colors";
import { getCurrentPlaylist } from "@store/store";
import { PlaylistImageColors } from "@store/types";
import { lightenColor } from "@utils/otherUtils";
import React, { useState } from "react";

// Currently doesn't do much, but in the future, may need to process something??
const usePlaylistColors = () => {
  const currPlaylist = getCurrentPlaylist();
  const [playlistColors, setPlaylistColors] = useState();

  let currColors = currPlaylist.imageColors;
  const standardColors = getStandardColors(currColors);

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
        colorLuminance: 200,
      },
      secondary: {
        color: colors.amber200,
        colorType: "light",
        // The color to use for text or items ifsecondary is the bg color.
        tintColor: colors.amber950,
        colorLuminance: 180,
      },
      detail: {
        color: colors.amber100,
        colorType: "light",
        // The color to use for text or items if detail is the bg color.
        tintColor: colors.amber950,
        colorLuminance: 200,
      },
    };
  }
  return { ...currColors, ...standardColors };
};

function getStandardColors(plColors: PlaylistImageColors) {
  const background = plColors.background;
  const secondary = plColors.secondary;
  const primary = plColors.primary;
  const detail = plColors.detail;
  const standard = {
    bg: background.color,
    bgText: background.tintColor,
    bgBorder: primary.color,
    btnBg: secondary.color,
    btnText: secondary.tintColor,
    btnBorder: primary.color,
    sliderMinTrack: secondary.color,
    sliderMaxTrack: lightenColor(secondary.color, 75), // May need to check if light or dark
    sliderThumb: secondary.color,
    gradientTop: secondary.color,
    gradientTopText: secondary.tintColor,
    gradientMiddle: background.color,
    gradientLast: colors.amber50,
  };
  return standard;
}

export default usePlaylistColors;
