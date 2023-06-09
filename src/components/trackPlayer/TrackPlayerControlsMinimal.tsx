import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { getCurrentPlaylist, usePlaybackStore } from "../../store/store";
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
const CONTROLSIZE = 25;
const TrackPlayerControls = ({ style }: Props) => {
  const playbackActions = usePlaybackStore((state) => state.actions);
  // const [playerState, setPlayerState] = useState(null);
  const playerState = usePlaybackStore((state) => state.playerState);
  // const playlist = usePlaybackStore((state) => state.currentPlaylist);
  const playlist = getCurrentPlaylist();
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

  return (
    <View className="flex flex-col justify-center items-center">
      <View
        className="flex-row gap-10 items-center justify-center"
        style={style}
      >
        {/* SEEK BACK */}
        <TouchableOpacity onPress={() => actions.jumpBack(10)}>
          <BackInTimeIcon size={CONTROLSIZE} />
        </TouchableOpacity>
        {/* PREV TRACK */}
        {/* <TouchableOpacity onPress={() => actions.prev()}>
          <BackIcon size={CONTROLSIZE} />
        </TouchableOpacity> */}
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
        {/* <TouchableOpacity onPress={() => actions.next()}>
          <NextIcon size={CONTROLSIZE} />
        </TouchableOpacity> */}
        {/* SEEK FORWARD */}
        <TouchableOpacity onPress={() => actions.jumpForward(10)}>
          <BackInTimeIcon
            style={{ transform: [{ scaleX: -1 }] }}
            size={CONTROLSIZE}
          />
        </TouchableOpacity>
      </View>
      <Text
        className="text-sm text-center "
        style={{ width: width / 1.5 }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {playlist.name}
      </Text>
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
