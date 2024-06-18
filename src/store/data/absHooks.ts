import { useQuery } from "@tanstack/react-query";
import { ABSGetLibraryItems, absGetLibraryFilterData, absGetLibraryItems } from "./absAPI";
import { reverse, sortBy } from "lodash";
import { useABSStore } from "@store/store-abs";
import { useMemo } from "react";

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
//~~ useGetBooks - Get list of books based on filter passed
//~~    Also pulls sort setting from absStore and updates whenever changes made to sort
//~~ ================================================================
export const useGetABSBooks = ({ filterType, filterValueEncoded }) => {
  console.log("In Use Get BOOKS Hook");
  const { field: sortField, direction } = useABSStore((state) => state.resultSort);

  console.log("Sort field", sortField, direction);
  const { data, ...rest } = useQuery({
    queryKey: ["ABSBooksFiltered", filterType, filterValueEncoded],
    queryFn: async () => await absGetLibraryItems({ filterType, filterValue: filterValueEncoded }),
    staleTime: 60000,
  });
  // Sort Books first
  let books = direction === "asc" ? sortBy(data, [sortField]) : reverse(sortBy(data, [sortField]));

  // If sortValue is passed then we are searching on author or title, filter the data before returning.
  return {
    books,
    ...rest,
  };
};

//~~ ================================================================
//~~ useGetAllBooks - Returns a list of books filtered by absStore's searchObject
//~~    If NO search criteria, nothing is return
//!!    May update this to return random list of 50 books
//~~    Initial pull of data is on app startup in main index.ts route.  Stale time is 30 minutes
//~~ ================================================================
// preload will only "run" the useQuery.  We don't want any data, just loading the data in background
export const useGetAllABSBooks = () => {
  const { title, author, description, genres, tags } = useABSStore((state) => state.searchObject);
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

  // Filter the data.
  let filterData: ABSGetLibraryItems = [];
  for (const book of data) {
    const bookTitle = book.title.toLowerCase() || "";
    const bookAuthor = book.author.toLowerCase() || "";
    const bookDescription = book.description?.toLowerCase() || "";

    let includeFlag = undefined;

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
//~~ checkValue - helper function that returns whether a book should be included
//~~   in the output.
//~~   Will be reworked to allow "and" / "or" operations
//~~  fieldValue is the source value from the database
//~~  checkValue is the value we are searching for (user input)
//~~ ======================================================================
const checkString = (fieldValue: string, checkValue: string, currentIncludeValue: boolean) => {
  if (!checkValue || checkValue === "") return currentIncludeValue;
  if (currentIncludeValue === undefined) {
    currentIncludeValue = true;
  }
  if (fieldValue.includes(checkValue)) {
    return true && currentIncludeValue;
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
