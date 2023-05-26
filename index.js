import "expo-router/entry";
import "react-native-reanimated";
import "react-native-gesture-handler";
import TrackPlayer from "react-native-track-player";
import { PlaybackService } from "./src/utils/trackPlayerUtils";

TrackPlayer.registerPlaybackService(() => PlaybackService);
