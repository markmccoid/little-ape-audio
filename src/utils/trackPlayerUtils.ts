import TrackPlayer, { Event } from "react-native-track-player";
import { usePlaybackStore, useTracksStore } from "../store/store";
import { getCurrentChapter } from "./chapterUtils";
import { Chapter } from "@store/store-functions";
import { ApeTrack } from "@store/types";
import { reverse } from "lodash";

//! =================================
//! REMOTE FUNCTIONS
//! =================================
export const handleRemoteNext = async () => {
  const trackIndex = await TrackPlayer.getActiveTrackIndex();
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
  const trackIndex = await TrackPlayer.getActiveTrackIndex();
  const rate = await TrackPlayer.getRate();

  if (trackIndex === 0) {
    await TrackPlayer.seekTo(0);
  } else {
    await TrackPlayer.skipToPrevious();
  }
  TrackPlayer.setRate(rate);
};

export const handleRemoteJumpForward = async () => {
  const { position: currPos, duration: currDuration } = await TrackPlayer.getProgress();
  // const currDuration = await TrackPlayer.getDuration();
  const newPos = currPos + 10;
  if (newPos > currDuration) {
    await handleRemoteNext();
  } else {
    await TrackPlayer.seekTo(newPos);
  }
};
export const handleRemoteJumpBackward = async () => {
  const { position: currPos } = await TrackPlayer.getProgress();
  const newPos = currPos - 10;
  if (newPos < 0) {
    await handleRemotePrev();
    const { duration } = await TrackPlayer.getProgress();
    await TrackPlayer.seekTo(duration + newPos);
  } else {
    await TrackPlayer.seekTo(newPos);
  }
};
export const PlaybackService = async () => {
  // This service needs to be registered for the module to work
  // but it will be used later in the "Receiving Events" section
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, handleRemoteNext);
  TrackPlayer.addEventListener(Event.RemoteJumpForward, handleRemoteJumpForward);
  TrackPlayer.addEventListener(Event.RemoteJumpBackward, handleRemoteJumpBackward);
  TrackPlayer.addEventListener(Event.RemotePrevious, handleRemotePrev);
  TrackPlayer.addEventListener(Event.RemoteBookmark, handleRemotePrev);
  TrackPlayer.addEventListener(Event.RemoteSeek, (seek) => TrackPlayer.seekTo(seek.position));
  TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
    const { paused, permanent } = event;

    if (paused) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  });
  //------------------------------------------
  //-- PROGRESS UPDATED
  //------------------------------------------
  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, async (event) => {
    // Progress Updates {"buffered": 127.512, "duration": 127.512, "position": 17.216, "track": 0}
    // console.log("PROGRESS UPDATE");
    // Update the playback store with the current info:
    // - currentTrackPosition
    // - chapterInfo -> undefined if no chapters
    // - chapterIndex -> -1 if no chapters
    const position = Math.floor(event.position);
    const queue = usePlaybackStore.getState().trackPlayerQueue;
    const trackIndex = await TrackPlayer.getActiveTrackIndex();

    const { chapterInfo, chapterIndex, chapterProgressOffset, nextChapterExists } =
      getCurrentChapter({
        chapters: queue[trackIndex]?.chapters,
        position: position,
      });
    // console.log("chapter index", chapterIndex, position, chapterInfo);
    // Set Data
    usePlaybackStore.getState().actions.setCurrentTrackPosition(position);
    usePlaybackStore.setState({
      currentTrack: queue[trackIndex],
      currentTrackIndex: trackIndex,
      currentChapterInfo: chapterInfo,
      currentChapterIndex: chapterIndex,
      chapterProgressOffset,
      nextChapterExists,
    });
  });
  // ------------------------------
  // -- PlaybackState
  // -- ALSO in store.ts mountListeneres
  // ------------------------------
  TrackPlayer.addEventListener(Event.PlaybackState, async (event) => {
    // console.log("STATE CHANGE", event);
    usePlaybackStore.setState({ playerState: event.state });
  });
  // ------------------------------
  // -- METADATA Chapters IOS only
  // ------------------------------
  TrackPlayer.addEventListener(Event.MetadataChapterReceived, async (event) => {
    let metaChapters: Chapter[] = [];
    const currTrack = (await TrackPlayer.getActiveTrack()) as ApeTrack;
    // return;

    // If book has chapters don't do anything
    if (!!currTrack?.chapters || !event?.metadata?.length) return;
    // if we have metadata get chapter info

    if (event?.metadata) {
      // console.log("chapt Data rec", event.metadata);
      const reverseChapt = reverse(event.metadata);
      let lastEndTime = Math.floor(currTrack.duration);
      for (const chapt of reverseChapt) {
        const startSeconds = Math.floor(chapt?.raw[0].time);
        const durationSeconds = lastEndTime === 0 ? 0 : lastEndTime - startSeconds;

        metaChapters.push({
          title: chapt?.raw[0].value as string,
          startSeconds: startSeconds,
          endSeconds: lastEndTime,
          startMilliSeconds: startSeconds * 1000,
          endMilliSeconds: lastEndTime * 1000,
          durationSeconds: durationSeconds,
          lengthMilliSeconds: durationSeconds * 1000,
        });
        lastEndTime = startSeconds - 1;
      }
      const finalChapters = reverse(metaChapters);

      await useTracksStore
        .getState()
        .actions.updateTrackMetadata(currTrack.id, { chapters: finalChapters });
    }
  });
};
