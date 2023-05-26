import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { usePlaybackStore } from "../../store/store";
import { useProgress } from "react-native-track-player";

const TrackPlaybackState = () => {
  // const currentPosition = usePlaybackStore((state) => state.currentPosition);
  // const currTrack = usePlaybackStore((state) => state.currentTrack?.id);
  // const playbackActions = usePlaybackStore((state) => state.actions);
  // const shouldLoadNext = usePlaybackStore((state) => state.shouldLoadNextTrack);
  // const [loadingNext, setLoadingNext] = useState(false);
  // const { isPlaying, durationSeconds, isLoaded } = usePlaybackStore(
  //   (state) => state.playbackState
  // );
  // useEffect(() => {
  //   const loadNext = async () => {
  //     // console.log("PLAYER- UseEffect SHOULD LOAD", shouldLoadNext, loadingNext);
  //     setLoadingNext(true);
  //     if (shouldLoadNext && !loadingNext) {
  //       console.log("LOAD NEXT TRACK");
  //       await playbackActions.loadNextTrack();
  //     }
  //     setLoadingNext(false);
  //   };
  //   loadNext();
  // }, [shouldLoadNext, loadingNext]);

  const progress = useProgress();
  return (
    <View>
      <Text>playing-Loaded: {`Buffered-->${progress.buffered}`}</Text>
      <Text>duration: {progress.duration} for</Text>
      <Text>pos: {progress.position}</Text>
    </View>
  );
};

export default TrackPlaybackState;
