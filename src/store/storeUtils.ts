import { AudioTrack } from "./types";

export const defaultImages = {
  image01: require("../../assets/images/LittleApAudio01.png"),
  image02: require("../../assets/images/LittleApAudio02.png"),
  image03: require("../../assets/images/LittleApAudio03.png"),
  image04: require("../../assets/images/LittleApAudio04.png"),
  image05: require("../../assets/images/LittleApAudio05.png"),
  image06: require("../../assets/images/LittleApAudio06.png"),
  image07: require("../../assets/images/LittleApAudio07.png"),
  image08: require("../../assets/images/LittleApAudio08.png"),
  image09: require("../../assets/images/LittleApAudio09.png"),
  image10: require("../../assets/images/LittleApAudio10.png"),
  image11: require("../../assets/images/LittleApAudio11.png"),
  image12: require("../../assets/images/LittleApAudio12.png"),
  image13: require("../../assets/images/LittleApAudio13.png"),
};

export function getRandomNumber() {
  const randomNumber = Math.floor(Math.random() * 13) + 1; // Generate random number between 1 and 13
  return randomNumber.toString().padStart(2, "0"); // Pad number with leading zero if less than 10
}

//~ -----------------------------------
//~ analyzePlaylistTracks
//~ Takes the current tracks for a playlist and returns
//~ the unique genres on the track and the total duration
//~ of tracks added together.
//~ it used to return only unique images, but with the addition of
//~ aspectRatio, I decided to return all images with their aspect ratio
//~ in an object
//~ -----------------------------------
export const analyzePlaylistTracks = (
  storedTracks: AudioTrack[],
  tracks: string[]
) => {
  let totalDuration = 0;
  // let imageSet = new Set();
  let genreSet = new Set();
  let images = [] as { image: string; aspectRatio: number }[];
  for (let trackId of tracks) {
    const track = storedTracks.find((el) => el.id === trackId);
    // imageSet.add(track?.metadata?.pictureURI);
    // Only push an image if it exists!
    if (track?.metadata?.pictureURI) {
      images.push({
        image: track?.metadata?.pictureURI,
        aspectRatio: track?.metadata?.pictureAspectRatio,
      });
    }
    genreSet.add(track?.metadata?.genre);
    totalDuration = totalDuration + (track?.metadata?.durationSeconds || 0);
  }

  return {
    // images: [...imageSet] as string[],
    images,
    genres: [...genreSet] as string[],
    totalDuration,
  };
};

/**
 * parseTrackPositions
 *  Called to set the playbackObj prevTracks, currentTrack and nextTracks properties
 *  If you have  [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }, { id: "e" }];
 *  and currentTrack ID is c, you get:
 * {
    prevTracks: [ { id: 'a' }, { id: 'b' } ],
    currTrack: { id: 'c' },
    nextTracks: [ { id: 'd' }, { id: 'e' } ]
  }
 * now to play previous you  -> prevTracks.slice(-1)
 * to play next you -> nextTracks.slice(0, 1)
 * @param tracks AudioTrack[] - Array of AudioTrack objects
 * @param currentTrackId - Current track id in playlist
 * @returns 
 */
export const parseTrackPositions = (
  tracks: AudioTrack[],
  currentTrackId: string
) => {
  let currTrack;
  let prevTracks = [];
  let nextTracks = [];
  let found = false;
  for (let track of tracks) {
    if (currentTrackId === track.id) {
      currTrack = track;
      found = true;
      continue;
    }

    if (found) {
      nextTracks.push(track);
    } else {
      prevTracks.push(track);
    }
  }
  return {
    prevTracks,
    currTrack,
    nextTracks,
  };
};
