import { StyleSheet, Text, View } from "react-native";
// import DropboxAuth from "@components/dropbox/DropboxAuth";
import { Link } from "expo-router";
import TrackPlayer, { Track } from "react-native-track-player";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import PlaylistContainer from "../../src/components/playlists/PlaylistContainer";

const track: Track = {
  id: "one",
  url: require("../../assets/funk.mp3"),
  artist: "Hunter McCoid",
  artwork: require("../../assets/littleapeaudio.png"),
  isLiveStream: true,
};
export default function AudioScreen() {
  return (
    <View style={styles.container}>
      <PlaylistContainer />
      <View style={styles.main}>
        <Text style={styles.title}>Hello World</Text>
        <Link href="../settings">Settings</Link>
        <Link href="./audio/dropbox">Get From Dropbox</Link>
        <TouchableOpacity
          onPress={async () => {
            await TrackPlayer.add([track]);
            await TrackPlayer.play();
          }}
        >
          <Text>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => TrackPlayer.pause()}>
          <Text>Pause</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  main: {
    flex: 1,
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
});
