import { AudioTrack, PlaylistImageColors } from "./types";

export const defaultImages = {
  image01: require("../../assets/images/LittleApAudio01.jpg"),
  image02: require("../../assets/images/LittleApAudio02.jpg"),
  image03: require("../../assets/images/LittleApAudio03.jpg"),
  image04: require("../../assets/images/LittleApAudio04.jpg"),
  image05: require("../../assets/images/LittleApAudio05.jpg"),
  image06: require("../../assets/images/LittleApAudio06.jpg"),
  image07: require("../../assets/images/LittleApAudio07.jpg"),
  image08: require("../../assets/images/LittleApAudio08.jpg"),
  image09: require("../../assets/images/LittleApAudio09.jpg"),
  image10: require("../../assets/images/LittleApAudio10.jpg"),
  image11: require("../../assets/images/LittleApAudio11.jpg"),
  image12: require("../../assets/images/LittleApAudio12.jpg"),
};

export function getRandomNumber() {
  const randomNumber = Math.floor(Math.random() * 12) + 1; // Generate random number between 1 and 13
  return randomNumber.toString().padStart(2, "0"); // Pad number with leading zero if less than 10
}

const hashStringToNumber = (str: string) => {
  // let hash = 0;
  // for (let i = 0; i < str.length; i++) {
  //   hash = str.charCodeAt(i) + ((hash << 5) - hash);
  //   hash = hash & hash; // Convert to 32bit integer
  // }
  // return Math.abs(hash);

  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
};

export const getImageIndex = (filename: string) => {
  const hash = hashStringToNumber(filename);
  const num = (hash % Object.keys(defaultImages).length) + 1;
  return num.toString().padStart(2, "0");
};

//~ -----------------------------------
//~ analyzePlaylistTracks
//~ Takes the current tracks for a playlist and returns
//~ the unique genres on the track and the total duration
//~ of tracks added together.
//~ it used to return only unique images, but with the addition of
//~ aspectRatio, I decided to return all images with their aspect ratio
//~ in an object
//~ -----------------------------------
export const analyzePlaylistTracks = (storedTracks: AudioTrack[], tracks: string[]) => {
  let totalDuration = 0;
  // let imageSet = new Set();
  let genreSet = new Set();
  let images = [] as { image: string; aspectRatio: number; imageColors: PlaylistImageColors }[];
  for (let trackId of tracks) {
    const track = storedTracks.find((el) => el.id === trackId);
    // imageSet.add(track?.metadata?.pictureURI);
    // Only push an image if it exists!
    if (track?.metadata?.pictureURI) {
      images.push({
        image: track?.metadata?.pictureURI,
        aspectRatio: track?.metadata?.pictureAspectRatio,
        imageColors: track?.metadata?.pictureColors,
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
export const parseTrackPositions = (tracks: AudioTrack[], currentTrackId: string) => {
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
