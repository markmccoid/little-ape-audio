import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { Link, Stack, useSearchParams } from "expo-router";
import { useGetQueue, usePlaybackStore } from "../../src/store/store";
import TrackPlayer, {
  Track,
  useTrackPlayerEvents,
  Event,
} from "react-native-track-player";
import { TouchableOpacity } from "react-native-gesture-handler";
import TrackPlaybackState from "../../src/components/trackPlayer/TrackPlaybackState";
import TrackPlayerControls from "../../src/components/trackPlayer/TrackPlayerControls";

const PlaylistScreen = () => {
  const playlistId = usePlaybackStore((state) => state.currentPlaylist);
  const queue = usePlaybackStore((state) => state.trackPlayerQueue);
  const currentTrack = usePlaybackStore((state) => state.currentTrack);
  const actions = usePlaybackStore((state) => state.actions);
  const hookTracks = useGetQueue();

  const [trackInfo, setTrackInfo] = useState<Track>();

  useTrackPlayerEvents(
    [Event.PlaybackTrackChanged, Event.PlaybackState],
    async (event) => {
      if (event.type === Event.PlaybackState) {
        console.log(event.state);
      }
      if (
        event.type === Event.PlaybackTrackChanged &&
        event.nextTrack != null
      ) {
        const track = await TrackPlayer.getTrack(event.nextTrack);
        const { title } = track || {};
        setTrackInfo(track);
      }
    }
  );

  return (
    <View>
      <Stack.Screen options={{ title: playlistId.author }} />
      <Text>PlaylistScreen</Text>
      <TrackPlaybackState />
      <Link href="./playersettings">Playlist Settings</Link>
      <TrackPlayerControls />
      <TouchableOpacity onPress={actions.play}>
        <Text className="p-2 border border-black">Play</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={actions.pause}>
        <Text className="p-2 border border-black">Pause</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={actions.next}>
        <Text className="p-2 border border-black">Next</Text>
      </TouchableOpacity>
      <View>
        {queue?.map((el) => {
          return (
            <View
              key={el.url}
              className={`p-2 border border-amber-500 ${
                currentTrack?.title === el.title ? "bg-red-300" : "bg-white"
              }`}
            >
              <Text>{el.title}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default PlaylistScreen;
