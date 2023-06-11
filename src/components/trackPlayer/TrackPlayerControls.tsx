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
  ForwardIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  RewindIcon,
} from "../common/svg/Icons";
import { Event, State } from "react-native-track-player";
import { useSettingStore } from "../../store/store-settings";

const { width, height } = Dimensions.get("window");
// Subscribing to the following events inside MyComponent
const events = [Event.PlaybackState, Event.PlaybackError];

type Props = {
  style?: ViewStyle;
};
const CONTROLSIZE = 35;
const TrackPlayerControls = ({ style }: Props) => {
  const jumpSeconds = useSettingStore((state) => state.jumpForwardSeconds);
  const playbackActions = usePlaybackStore((state) => state.actions);
  // const [playerState, setPlayerState] = useState(null);
  const playerState = usePlaybackStore((state) => state.playerState);
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
        {/* PREV TRACK */}
        <TouchableOpacity onPress={() => actions.prev()}>
          <BackIcon size={CONTROLSIZE} />
        </TouchableOpacity>
        {/* SEEK BACK */}
        <TouchableOpacity onPress={() => actions.jumpBack(jumpSeconds)}>
          <RewindIcon
            size={CONTROLSIZE}
            // style={{ transform: [{ rotateZ: "45deg" }, { scale: 1.2 }] }}
          />
          <Text style={{ position: "absolute", bottom: -10, left: 12 }}>
            {jumpSeconds}
          </Text>
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
        {/* SEEK FORWARD */}
        <TouchableOpacity onPress={() => actions.jumpForward(jumpSeconds)}>
          <ForwardIcon
            size={CONTROLSIZE}
            // style={{ transform: [{ rotateZ: "45deg" }, { scale: 1.2 }] }}
          />
          <Text style={{ position: "absolute", bottom: -10, right: 12 }}>
            {jumpSeconds}
          </Text>
        </TouchableOpacity>
        {/* NEXT TRACK */}
        <TouchableOpacity onPress={() => actions.next()}>
          <NextIcon size={CONTROLSIZE} />
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
