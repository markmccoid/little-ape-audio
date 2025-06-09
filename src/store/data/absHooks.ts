import { useQuery } from "@tanstack/react-query";
import {
  ABSGetLibraryItems,
  absGetItemDetails,
  absGetLibraryFilterData,
  absGetLibraryItems,
  getUserFavoriteTagInfo,
} from "./absAPI";
import { reverse, sortBy } from "lodash";
import { useABSStore } from "@store/store-abs";
import { useMemo } from "react";
import { btoa } from "react-native-quick-base64";
import { useDropboxStore } from "@store/store-dropbox";
import { sanitizeString } from "@utils/otherUtils";
import { el } from "date-fns/locale";
import { EbookFile } from "./absTypes";

//~~ ================================================================
//~~ useGetFilterData - Get the filter data for the library
//~~ ================================================================
export const useGetFilterData = () => {
  const { data, ...rest } = useQuery({
    queryKey: ["absfilterdata"],
    queryFn: async () => await absGetLibraryFilterData(),
  });

  return { filterData: data, ...rest };
};

//~~ ================================================================
//~~ useGetAllBooks - Returns a list of books filtered by absStore's searchObject
//~~    If NO search criteria, nothing is return
//!!    May update this to return random list of 50 books
//~~    Stale time is 10 minutes
//~~ ================================================================
export const useGetAllABSBooks = () => {
  const folderAttributes = useDropboxStore((state) => state.folderAttributes);
  const {
    title,
    author,
    authorOrTitle,
    description,
    genres,
    tags,
    favorites: showFavorites,
    isRead: isReadOption,
  } = useABSStore((state) => state.searchObject);
  const { field, direction } = useABSStore((state) => state.resultSort);
  const { data, ...rest } = useQuery({
    queryKey: ["allABSBooks"],
    queryFn: async () => await absGetLibraryItems({}),
  });

  // const { data: progressData, ...progressRest } = useQuery({
  //   queryKey: ["allABSBooks-finished"],
  //   queryFn: async () =>
  //     await absGetLibraryItems({ filterType: "progress", filterValue: "ZmluaXNoZWQ=" }),
  // });

  if (rest.isLoading || rest.isError) {
    return {
      books: [],
      totalBookCount: data?.length || 0,
      selectedBookCount: -1,
      ...rest,
    };
  }

  //~ -----------------------------------------
  //~ Get the local favorites and read ids from folderAttributes
  //~ NOTE: Even though the absGetLibraryItems call returns isFavorite and isFinished,
  //~ from the ABS Server, we need to do this to keep updated because we don't always
  //~ update pull from the ABS server everytime this query is run. This keeps us in sync without quering the server all the time.
  const isFavoriteIds = new Set(folderAttributes.filter((el) => el.isFavorite).map((el) => el.id));
  const isReadIds = new Set(folderAttributes.filter((el) => el.isRead).map((el) => el.id));

  // For abs, sanitizeString takes the uuid (el.id) and returns a string with the hypens turned to underscores
  // abdfef-4fef-4fef-4fef-4fe -> abdfef_4fef_4fef_4fef_4fe
  // This map will apply the local favorites and read ids to each book.
  const dataWAttributes = data?.map((el) => ({
    ...el,
    isFavorite: isFavoriteIds.has(sanitizeString(el.id)),
    isFinished: isReadIds.has(sanitizeString(el.id)),
  }));
  //~ -----------------------------------------

  // If no search criteria, return the data
  if (
    !title &&
    !author &&
    !description &&
    !genres?.length &&
    !tags?.length &&
    !authorOrTitle &&
    !showFavorites &&
    !isReadOption
  ) {
    const filterData =
      direction === "asc"
        ? sortBy(dataWAttributes, [field])
        : reverse(sortBy(dataWAttributes, [field]));
    return {
      books: filterData,
      totalBookCount: filterData?.length || 0,
      selectedBookCount: filterData?.length || 0,
      ...rest,
    };
  }
  // Filter the data.
  // Grab the folder attributes and create an array of ids that are marked as favs
  let filterData: ABSGetLibraryItems = [];
  let favoriteTag = getUserFavoriteTagInfo().favoriteUserTagValue.toLowerCase();

  // Loop through the data and apply the search criteria
  for (const book of dataWAttributes) {
    const bookTitle = book.title.toLowerCase() || "";
    const bookAuthor = book.author.toLowerCase() || "";
    const bookDescription = book.description?.toLowerCase() || "";
    const isFavorite = isFavoriteIds.has(sanitizeString(book.id));
    const isRead = isReadIds.has(sanitizeString(book.id));

    let includeFlag = undefined;

    //-- Author Or Title match
    if (authorOrTitle) {
      includeFlag = checkString(bookAuthor, authorOrTitle.toLowerCase(), false, "or");
      includeFlag = checkString(bookTitle, authorOrTitle.toLowerCase(), includeFlag, "or");
    }
    // -- Title match
    includeFlag = checkString(bookTitle, title, includeFlag);
    // -- Author match
    includeFlag = checkString(bookAuthor, author, includeFlag);
    // -- Description match
    includeFlag = checkString(bookDescription, description, includeFlag);
    // -- Genre match
    includeFlag = checkArray(book?.genres, genres, includeFlag);
    // -- Tags match
    includeFlag = checkArray(book?.tags, tags, includeFlag);
    // -- showFavorite match
    if (showFavorites) {
      const currFlag = includeFlag === undefined ? true : includeFlag;
      includeFlag = showFavorites === "exclude" ? !isFavorite && currFlag : isFavorite && currFlag;
    }
    if (isReadOption) {
      const currFlag = includeFlag === undefined ? true : includeFlag;
      includeFlag = isReadOption === "exclude" ? !isRead && currFlag : isRead && currFlag;
    }

    if (includeFlag) {
      filterData.push(book);
    }
  }

  filterData =
    direction === "asc" ? sortBy(filterData, [field]) : reverse(sortBy(filterData, [field]));
  return {
    books: filterData,
    totalBookCount: data?.length || 0,
    selectedBookCount: filterData?.length || 0,
    ...rest,
  };
};

//~~ ======================================================================
//~~ useBookDetails
//~~ ======================================================================
export type BookDetails = ReturnType<typeof useBookDetails>;
export const useBookDetails = (bookId: string) => {
  return useQuery({
    queryKey: ["book_details", bookId],
    queryFn: async () => {
      const data = await absGetItemDetails(bookId);
      // create a key with ALL of the ebooks for this book
      // the primary ebook will be the first in the array.
      const ebookIno = data.media.ebookFile.ino;
      const otherEbookLibraryFiles = data.libraryFiles
        .filter((el) => el.ino !== ebookIno && el.fileType === "ebook")
        .map(
          (el) =>
            ({
              ino: el.ino,
              metadata: el.metadata,
              ebookFormat: el.metadata.ext,
              addedAt: el.addedAt,
              updatedAt: el.updatedAt,
            } as EbookFile)
        );
      const allEbooks = [data.media.ebookFile, ...otherEbookLibraryFiles];
      // console.log("otherEbookLibraryFiles", Object.keys(otherEbookLibraryFiles[0]));
      return { ...data, ebooks: allEbooks };
    },
    // 30 second stale time
    // the thought being that I call this from multiple places and don't want to keep refetching
    // when loading components.
    staleTime: 3 * 1 * 1000,
  });
};

//~~ ======================================================================
//~~ useGetSeriesBooks
//~~   Takes an item(book) ID and gets the book details.  The details will
//~~   will contain the series ID.
//~~   Then we filter the Libraries books by the series ID and get back the books
//~~   in the series
//~~ ======================================================================
export const useGetSeriesBooks = (bookId: string) => {
  const { data, isError, isLoading, error } = useQuery({
    queryKey: [bookId],
    queryFn: async () => await absGetItemDetails(bookId),
  });

  const seriesArray = data?.media?.metadata?.series || [];
  const { data: seriesBooks, ...rest } = useQuery({
    queryKey: ["series", ...seriesArray.map((el) => el.id)],
    queryFn: async () =>
      getSeriesBooks(
        seriesArray.map((el) => el.id),
        seriesArray
      ),
    enabled: !!seriesArray[0]?.id,
  });

  // NOTE:  The seriesInfo is pulled from the Book ID that was used to get the series ID
  //        The series object has an id, name and sequence, with sequence being the book number
  //        that said book is in the series.  i.e. it is meaningless in the return so we don't return it.

  if (rest.isLoading || isLoading) {
    return {
      series: [{ id: undefined, name: undefined, books: [] }],
      ...rest,
    };
  }

  return { series: seriesBooks || [], ...rest };
};

//~~ ---------
//~~ Helper function that, if multiple series on book, will get info for each series
//~~  uses Promise.all()
//~~ ---------
async function getSeriesBooks(seriesIds: string[], seriesInfo: { id: string; name: string }[]) {
  const promises = seriesIds.map(async (id) => {
    const seriesDetail = seriesInfo.find((el) => el.id === id);
    const response = await absGetLibraryItems({
      filterType: "series",
      filterValue: btoa(id),
      sortBy: "media.metadata.series.sequence",
    });
    return { id: seriesDetail.id, name: seriesDetail.name, books: response || [] };
  });

  const data = await Promise.all(promises);
  return data;
}
//~~ ======================================================================
//~~ checkValue - helper function that returns whether a book should be included
//~~   in the output.
//~~   Will be reworked to allow "and" / "or" operations
//~~  fieldValue is the source value from the database
//~~  checkValue is the value we are searching for (user input)
//~~ ======================================================================
const checkString = (
  fieldValue: string,
  checkValue: string,
  currentIncludeValue: boolean,
  logicalOperator?: "and" | "or"
) => {
  if (!checkValue || checkValue === "") return currentIncludeValue;
  if (currentIncludeValue === undefined) {
    currentIncludeValue = true;
  }
  logicalOperator = logicalOperator ?? "and";
  if (logicalOperator === "and") {
    if (fieldValue.includes(checkValue)) {
      return true && currentIncludeValue;
    }
    return false;
  }

  // logicalOperator is OR
  if (fieldValue.includes(checkValue) || currentIncludeValue) {
    return true;
  }
  return false;
};

//~~ ======================================================================
//~~  checking arrays agains arrays
//~~  fieldValue is the source value from the database
//~~  checkValue is the value we are searching for (user input)
//~~ ======================================================================
const checkArray = (fieldArray: string[], checkArray: string[], currentIncludeValue: boolean) => {
  if (!checkArray || checkArray.length === 0) return currentIncludeValue;
  if (currentIncludeValue === undefined) {
    currentIncludeValue = true;
  }

  if (checkArray.some((el) => fieldArray.includes(el))) {
    return true && currentIncludeValue;
  }
  return false;
};

function generateRandomIntegers(count, min, max) {
  const randomNumbers = new Set();

  while (randomNumbers.size < count) {
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    randomNumbers.add(randomNumber);
  }

  return Array.from(randomNumbers);
}
