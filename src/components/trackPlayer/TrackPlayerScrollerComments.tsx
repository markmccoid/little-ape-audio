import { View, Text, ScrollView, Dimensions, Pressable } from "react-native";
import React from "react";
import {
  useCurrentPlaylist,
  usePlaybackStore,
  useTrackActions,
  useTracksStore,
} from "@store/store";
import { formatSeconds } from "@utils/formatUtils";
import { EnterKeyIcon } from "@components/common/svg/Icons";

const { width, height } = Dimensions.get("window");
const COMPONENT_WIDTH = width - 80;

const TrackPlayerScrollerComments = () => {
  const actions = useTrackActions();
  const playbackTrack = usePlaybackStore((state) => state.currentTrack);
  const currTrackIndex = usePlaybackStore((state) => state.currentTrackIndex);
  const playlistId = usePlaybackStore((state) => state.currentPlaylistId);
  const playlists = useTracksStore((state) => state.playlists);
  const playbackActions = usePlaybackStore((state) => state.actions);

  const positionHistory = playlists[playlistId]?.positionHistory;
  const [trackComment, setTrackComment] = React.useState("");

  // Track comment
  React.useEffect(() => {
    const track = actions.getTrack(playbackTrack.id);
    const trackComment = track.metadata.comment;
    setTrackComment(trackComment);
  }, [playbackTrack]);

  return (
    <ScrollView
      style={{
        width: COMPONENT_WIDTH,
        height: COMPONENT_WIDTH,
        // padding: 10,
        marginVertical: 10,
      }}
      className=" border border-amber-700 bg-amber-100"
    >
      <View className="p-2 ">
        <Text className="font-semibold text-base mb-2">Progress History</Text>
        {positionHistory?.map((posObj, index) => {
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
              <View className="flex-row justify-between items-center border border-amber-800 bg-amber-300 p-2 mb-2 pr-4">
                <Text>
                  Track {posObj?.trackIndex + 1} - {formatSeconds(posObj?.position)}
                </Text>
                <EnterKeyIcon />
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default TrackPlayerScrollerComments;
