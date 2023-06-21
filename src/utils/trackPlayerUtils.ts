import TrackPlayer, { Event } from "react-native-track-player";
import { usePlaybackStore } from "../store/store";

//! =================================
//! REMOTE FUNCTIONS
//! =================================
export const handleRemoteNext = async () => {
  const trackIndex = await TrackPlayer.getCurrentTrack();
  const queue = await TrackPlayer.getQueue();
  const rate = await TrackPlayer.getRate();
  const plId = usePlaybackStore.getState().currentPlaylistId;

  if (queue.length - 1 === trackIndex) {
    await TrackPlayer.skip(0);
    await TrackPlayer.pause();
  } else {
    await TrackPlayer.skipToNext();
  }
  TrackPlayer.setRate(rate);
};

export const handleRemotePrev = async () => {
  const trackIndex = await TrackPlayer.getCurrentTrack();
  const rate = await TrackPlayer.getRate();

  if (trackIndex === 0) {
    await TrackPlayer.seekTo(0);
  } else {
    await TrackPlayer.skipToPrevious();
  }
  TrackPlayer.setRate(rate);
};

export const handleRemoteJumpForward = async () => {
  const currPos = await TrackPlayer.getPosition();
  const currDuration = await TrackPlayer.getDuration();
  const newPos = currPos + 10;
  if (newPos > currDuration) {
    await handleRemoteNext();
  } else {
    await TrackPlayer.seekTo(newPos);
  }
};
export const handleRemoteJumpBackward = async () => {
  const currPos = await TrackPlayer.getPosition();
  const newPos = currPos - 10;
  if (newPos < 0) {
    await handleRemotePrev();
    const duration = await TrackPlayer.getDuration();
    await TrackPlayer.seekTo(duration + newPos);
  } else {
    await TrackPlayer.seekTo(newPos);
  }
};
export const PlaybackService = async () => {
  // This service needs to be registered for the module to work
  // but it will be used later in the "Receiving Events" section
  TrackPlayer.addEventListener(
    Event.RemotePlay,
    () => console.log("REMOTEPLAY") || TrackPlayer.play()
  );
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, handleRemoteNext);
  TrackPlayer.addEventListener(
    Event.RemoteJumpForward,
    handleRemoteJumpForward
  );
  TrackPlayer.addEventListener(
    Event.RemoteJumpBackward,
    handleRemoteJumpBackward
  );
  TrackPlayer.addEventListener(Event.RemotePrevious, handleRemotePrev);
  TrackPlayer.addEventListener(Event.RemoteBookmark, handleRemotePrev);
  TrackPlayer.addEventListener(Event.RemoteSeek, (seek) =>
    TrackPlayer.seekTo(seek.position)
  );
  TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
    const { paused, permanent } = event;
    console.log("DUCK EVENT", event);
    if (paused) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  });
};
