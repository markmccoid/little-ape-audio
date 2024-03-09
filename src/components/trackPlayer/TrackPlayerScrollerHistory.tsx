import { View, Text, ScrollView, Dimensions, Pressable, StyleSheet } from "react-native";
import React from "react";
import {
  useCurrentPlaylist,
  usePlaybackStore,
  useTrackActions,
  useTracksStore,
} from "@store/store";
import { formatSeconds } from "@utils/formatUtils";
import { EnterKeyIcon } from "@components/common/svg/Icons";
import usePlaylistColors from "hooks/usePlaylistColors";
import { AudioTrack, Playlist } from "@store/types";

const { width, height } = Dimensions.get("window");
const COMPONENT_WIDTH = width - 80;
type Props = {
  playlist: Playlist;
  currentTrack: AudioTrack;
  compHeight: number;
};
const TrackPlayerScrollerHistory = ({ playlist, currentTrack, compHeight }: Props) => {
  const currTrackIndex = usePlaybackStore((state) => state.currentTrackIndex);
  const playlists = useTracksStore((state) => state.playlists);
  const playbackActions = usePlaybackStore((state) => state.actions);

  const positionHistory = playlists[playlist.id]?.positionHistory;

  const plColors = usePlaylistColors();

  const textColor = plColors.background.tintColor;
  const bgColor = plColors.background.color;
  const histTextColor = plColors.secondary.tintColor;
  const histbgColor = plColors.secondary.color;

  return (
    <ScrollView
      style={{
        // width: COMPONENT_WIDTH,
        height: compHeight,
        // padding: 10,
        marginVertical: 10,
        borderRadius: 10,
        backgroundColor: bgColor,
        borderWidth: StyleSheet.hairlineWidth,
      }}
      // contentContainerStyle={{ height: compHeight }}
    >
      <View className="p-2 ">
        <Text className="font-semibold text-base mb-2" style={{ color: textColor }}>
          Progress History
        </Text>
        {positionHistory &&
          positionHistory?.map((posObj, index) => {
            return (
              <Pressable
                onPress={async () => {
                  if (currTrackIndex !== posObj?.trackIndex) {
                    await playbackActions.goToTrack(posObj?.trackIndex);
                  }
                  await playbackActions.seekTo(posObj?.position);
                }}
                key={`${posObj?.position}-${index}`}
              >
                <View
                  className={`flex-row justify-between items-center  bg-amber-300 p-2 mb-2 pr-4`}
                  style={{
                    backgroundColor: histbgColor,
                    borderColor: plColors.primary.color,
                    borderWidth: StyleSheet.hairlineWidth,
                  }}
                >
                  <Text style={{ color: histTextColor }}>
                    Track {posObj?.trackIndex + 1} - {formatSeconds(posObj?.position)}
                  </Text>
                  <EnterKeyIcon color={histTextColor} />
                </View>
              </Pressable>
            );
          })}
      </View>
    </ScrollView>
  );
};

export default TrackPlayerScrollerHistory;
