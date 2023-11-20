import { Chapter } from "@store/store-functions";

type Params = { chapters: Chapter[]; position: number };

//~ ------------------------------------------
//~ getCurrentChapter
//~ ------------------------------------------
export const getCurrentChapter = ({ chapters = [], position }: Params) => {
  // const queueChapters = chapters[currentTrack.]
  // const qChapters = chapters?.[currentQueueId];

  if (chapters?.length > 0 && chapters[0].title !== "~NO CHAPTERS~") {
    let chapterProgressOffset = 0;
    for (let i = 0; i < chapters.length; i++) {
      chapterProgressOffset += chapters[i].startSeconds;
      // console.log("in GCC", position, i, chapters[i]?.endSeconds);
      if (position <= chapters[i]?.endSeconds) {
        return {
          chapterInfo: chapters[i],
          chapterIndex: i,
          nextChapterExists: i < chapters.length,
          chapterProgressOffset,
        };
        break;
      }
    }
  }
  return {
    chapterInfo: undefined,
    chapterIndex: -1,
    chapterProgressOffset: 0,
    nextChapterExists: false,
  };
};
