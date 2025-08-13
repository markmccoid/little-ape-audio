// import { absGetLibraryFilterData } from "@store/data/absAPI";
import { absAPIClient, useABSStore } from "@store/store-abs";
import { useQuery } from "@tanstack/react-query";

const formatFilterData = async () => {
  const libraryId = useABSStore.getState().activeLibraryId;
  const filterData = await absAPIClient.getLibraryFilterData(libraryId);
  // const filterData = await absGetLibraryFilterData(libraryId);

  return {
    genres: filterData?.genres ?? [],
    tags: filterData?.tags ?? [],
    authors: filterData?.authors ?? [],
    series: filterData?.series ?? [],
  };
};
function useFilterData() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["absfilterdata"],
    queryFn: async () => await formatFilterData(),
  });

  if (!isLoading) {
    const filterData = data;
  }

  return {
    data,
    isLoading,
    error,
  };
}

export default useFilterData;
