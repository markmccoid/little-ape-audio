import { colors } from "@constants/Colors";
import { getCurrentPlaylist, usePlaybackStore, useTrackActions } from "@store/store";
import { useSettingStore } from "@store/store-settings";
import { PlaylistImageColors } from "@store/types";
import { lightenColor } from "@utils/otherUtils";

// Currently doesn't do much, but in the future, may need to process something??
const usePlaylistColors = (playlistId?: string) => {
  const didUpdate = usePlaybackStore((state) => state.didUpdate);
  const currPlaylist = getCurrentPlaylist();
  const trackActions = useTrackActions();
  const isUsingDynamicColors = useSettingStore((state) => state.isUsingDynamicColors);

  if (!currPlaylist && !playlistId) return;
  let currColors = currPlaylist?.imageColors;
  if (playlistId) {
    currColors = trackActions.getPlaylist(playlistId)?.imageColors;
  }

  // Set option to turn off dynamic coloring and check it here
  // if (!currPlaylist?.imageColors?.background?.color || !isUsingDynamicColors) {
  if (!currColors?.background?.color || !isUsingDynamicColors) {
    currColors = {
      background: {
        color: colors.amber600,
        colorType: "dark",
        // The color to use for text or items if background is the bg color.
        tintColor: colors.amber950,
        colorLuminance: 150.01,
      },
      primary: {
        color: colors.amber100,
        colorType: "light",
        // The color to use for text or items if primary is the bg color.
        tintColor: colors.amber950,
        colorLuminance: 185.76,
      },
      secondary: {
        color: colors.amber200,
        colorType: "light",
        // The color to use for text or items ifsecondary is the bg color.
        tintColor: colors.amber950,
        colorLuminance: 181.15,
      },
      detail: {
        color: colors.amber100,
        colorType: "light",
        // The color to use for text or items if detail is the bg color.
        tintColor: colors.amber950,
        colorLuminance: 185.76,
      },
    };
  }
  const standardColors = getStandardColors(currColors);
  return { ...currColors, ...standardColors };
};

function getStandardColors(plColors: PlaylistImageColors) {
  const background = plColors?.background;
  const secondary = plColors?.secondary;
  const primary = plColors?.primary;
  const detail = plColors?.detail;

  const standard = {
    bg: background?.color,
    bgText: background?.tintColor,
    bgBorder: primary?.color,
    btnBg: secondary?.color,
    btnText: secondary?.tintColor,
    btnBorder: primary?.color,
    sliderMinTrack: secondary?.color,
    sliderMaxTrack: lightenColor(secondary?.color, 75), // May need to check if light or dark
    sliderThumb: secondary?.color,
    gradientTop: secondary?.color,
    gradientTopText: secondary?.tintColor,
    gradientMiddle: background?.color,
    gradientMiddleText: background?.tintColor,
    gradientLast: colors?.amber50,
  };
  return standard;
}

export default usePlaylistColors;
