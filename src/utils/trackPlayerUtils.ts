import { capitalize } from "lodash";
import TrackPlayer, { Event, Capability } from "react-native-track-player";

export const PlaybackService = async () => {
  // This service needs to be registered for the module to work
  // but it will be used later in the "Receiving Events" section
  await TrackPlayer.addEventListener(Event.RemotePlay, () =>
    TrackPlayer.play()
  );
  await TrackPlayer.addEventListener(Event.RemotePause, () =>
    TrackPlayer.pause()
  );
  await TrackPlayer.addEventListener(Event.RemoteNext, () =>
    TrackPlayer.skipToNext()
  );
  await TrackPlayer.addEventListener(Event.RemotePrevious, () =>
    TrackPlayer.skipToPrevious()
  );
  await TrackPlayer.addEventListener(Event.RemoteSeek, (seek) =>
    TrackPlayer.seekTo(seek.position)
  );
};
