import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { usePlaybackStore } from "../../store/store";
import {
  BackIcon,
  BackInTimeIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
} from "../common/svg/Icons";
import { useTrackPlayerEvents, Event, State } from "react-native-track-player";

const { width, height } = Dimensions.get("window");
// Subscribing to the following events inside MyComponent
const events = [Event.PlaybackState, Event.PlaybackError];

type Props = {
  style?: ViewStyle;
};
const CONTROLSIZE = 35;
const TrackPlayerControls = ({ style }: Props) => {
  const playbackActions = usePlaybackStore((state) => state.actions);
  // const [playerState, setPlayerState] = useState(null);
  const playerState = usePlaybackStore((state) => state.playerState);
  const playlistId = usePlaybackStore((state) => state.currentPlaylist);
  const queue = usePlaybackStore((state) => state.trackPlayerQueue);
  const isPlaylistLoaded = usePlaybackStore((state) => state.playlistLoaded);
  const actions = usePlaybackStore((state) => state.actions);
  const currentTrack = usePlaybackStore((state) => state.currentTrack);

  const isPlaying = playerState === State.Playing;

  //~ --- ----
  const play = async () => {
    await playbackActions.play();
  };
  const pause = async () => {
    playbackActions.pause();
  };

  if (!isPlaylistLoaded) {
    return null;
  }
  return (
    <View className="flex flex-col justify-center items-center">
      <Text
        className="text-sm text-center py-2"
        style={{ width: width / 1.25 }}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {currentTrack?.title}
      </Text>
      <View
        className="flex-row gap-10 items-center justify-center"
        style={style}
      >
        {/* SEEK BACK */}
        <TouchableOpacity onPress={() => actions.jumpBack(10)}>
          <BackInTimeIcon size={CONTROLSIZE} />
        </TouchableOpacity>
        {/* PREV TRACK */}
        <TouchableOpacity onPress={() => actions.prev()}>
          <BackIcon size={CONTROLSIZE} />
        </TouchableOpacity>
        {/* PLAY/PAUSE */}
        <TouchableOpacity
          onPress={isPlaying ? () => pause() : () => play()}
          style={styles.actionButton}
        >
          <View>
            {!isPlaying ? (
              <PlayIcon size={CONTROLSIZE} />
            ) : (
              <PauseIcon size={CONTROLSIZE} />
            )}
          </View>
        </TouchableOpacity>
        {/* NEXT TRACK */}
        <TouchableOpacity onPress={() => actions.next()}>
          <NextIcon size={CONTROLSIZE} />
        </TouchableOpacity>
        {/* SEEK FORWARD */}
        <TouchableOpacity onPress={() => actions.jumpForward(10)}>
          <BackInTimeIcon
            style={{ transform: [{ scaleX: -1 }] }}
            size={CONTROLSIZE}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  actionButton: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    // borderWidth: 1,
    // borderRadius: 5,
  },
});

export default TrackPlayerControls;
