import { useQuery } from "@tanstack/react-query";
import {
  ABSGetLibraryItems,
  absGetItemDetails,
  absGetLibraryFilterData,
  absGetLibraryItems,
} from "./absAPI";
import { reverse, sortBy } from "lodash";
import { useABSStore } from "@store/store-abs";
import { useMemo } from "react";
import { btoa } from "react-native-quick-base64";

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
  const { title, author, authorOrTitle, description, genres, tags } = useABSStore(
    (state) => state.searchObject
  );
  const { field, direction } = useABSStore((state) => state.resultSort);
  const { data, ...rest } = useQuery({
    queryKey: ["allABSBooks"],
    queryFn: async () => await absGetLibraryItems({}),
  });

  if (rest.isLoading || rest.isError) {
    return {
      books: [],
      totalBookCount: data?.length || 0,
      selectedBookCount: -1,
      ...rest,
    };
  }
  // const randNums = useMemo(() => generateRandomIntegers(25, 1, data?.length), []);
  // If not filters for data, then return 25 random books
  // if (!title && !author && !description && !genres?.length && !tags?.length) {
  //   let discoverBooks = [];
  //   for (const random of randNums) {
  //     discoverBooks.push(data[random as number]);
  //   }
  //   discoverBooks =
  //     direction === "asc"
  //       ? sortBy(discoverBooks, [field])
  //       : reverse(sortBy(discoverBooks, [field]));
  //   return {
  //     books: discoverBooks,
  //     totalBookCount: data?.length,
  //     selectedBookCount: -1,
  //     ...rest,
  //   };
  // }

  if (!title && !author && !description && !genres?.length && !tags?.length) {
    return {
      books: data,
      totalBookCount: data?.length || 0,
      selectedBookCount: data?.length || 0,
      ...rest,
    };
  }
  // Filter the data.
  let filterData: ABSGetLibraryItems = [];
  for (const book of data) {
    const bookTitle = book.title.toLowerCase() || "";
    const bookAuthor = book.author.toLowerCase() || "";
    const bookDescription = book.description?.toLowerCase() || "";

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
