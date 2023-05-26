import { AudioTrack } from "./store";

export const analyzePlaylistTracks = (
  storedTracks: AudioTrack[],
  tracks: string[]
) => {
  let totalDuration = 0;
  let imageSet = new Set();

  for (let trackId of tracks) {
    const track = storedTracks.find((el) => el.id === trackId);
    imageSet.add(track?.metadata?.pictureURI);
    totalDuration = totalDuration + (track?.metadata?.durationSeconds || 0);
  }

  return { images: [...imageSet] as string[], totalDuration };
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
