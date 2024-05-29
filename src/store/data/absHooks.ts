import { useQuery } from "@tanstack/react-query";
import { absGetLibraryItems } from "./absAPI";
import { reverse, sortBy } from "lodash";
import { useABSStore } from "@store/store-abs";

//~~ ================================================================
//~~ useGetBooks - Get list of books based on filter passed
//~~    Also pulls sort setting from absStore and updates whenever changes made to sort
//~~ ================================================================
export const useGetABSBooks = ({ filterType, filterValueEncoded }) => {
  console.log("In Use Get BOOKS Hook");
  const { field: sortField, direction } = useABSStore((state) => state.resultSort);
  const { searchField, searchValue } = useABSStore((state) => state.searchObject);

  const { data, ...rest } = useQuery({
    queryKey: [filterType, filterValueEncoded],
    queryFn: async () => await absGetLibraryItems({ filterType, filterValue: filterValueEncoded }),
    staleTime: 60000,
  });
  // console.log("Sort field", sortField, direction);
  // Sort Books first
  let books = direction === "asc" ? sortBy(data, [sortField]) : reverse(sortBy(data, [sortField]));
  if (searchValue && searchField.length > 0) {
    // console.log("searchValue", searchValue, searchField);
    books = books.filter((book) => book[searchField].includes(searchValue));
    // console.log("searchResults", books);
  }
  // const booksSorted = direction === "asc" ? sortBy(data, [sortField]) : reverse(sortBy(data, [sortField]));
  return {
    books,
    ...rest,
  };
};
