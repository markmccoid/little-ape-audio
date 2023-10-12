import { View, Text } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { FolderMetadata, useDropboxStore } from "@store/store-dropbox";
import { debounce, flatMap } from "lodash";
import Fuse from "fuse.js";
import { TextInput } from "react-native-gesture-handler";

export type FlatFolderMetadata = ReturnType<typeof formatFolderMD>;

const formatFolderMD = (folderData: FolderMetadata) => {
  // take the folderMetadata structure and compress into an array of book objects
  const arrayOfData = flatMap(
    Object.keys(folderData).map((key) => {
      return flatMap(folderData[key]);
    })
  );
  return arrayOfData;
};

const SearchBooksSearch = ({ setResultData }) => {
  const folderMetadata = useDropboxStore((state) => state.folderMetadata);
  const [searchData, setSearchData] = useState<FlatFolderMetadata>();
  const [searchText, setSearchText] = useState("");
  const fuse = useRef<Fuse<FlatFolderMetadata>>();

  // Format folderMetadata into a searchable array
  //! FUTURE may store this array structure in store
  // Also initialize fuse search object
  useEffect(() => {
    const allData = formatFolderMD(folderMetadata);
    setSearchData(allData);
    const fuseObj = fuseInit(allData);
    fuse.current = fuseObj;
  }, []);

  // Initiate search when searchText changes (Note: debounced)
  useEffect(() => {
    if (!searchData) return;
    // const res = fuse.current.search(searchText);
    fuseSearch(searchText);
  }, [searchText]);
  //~ START Debounce functions
  const fuseSearch = React.useCallback(
    debounce((searchText) => fuseSearchDebounced(searchText), 300),
    []
  );
  const fuseSearchDebounced = (searchText) => {
    const res = fuse.current.search(searchText);
    setResultData(res.map((el) => el.item));
  };
  //~ END Debounce functions

  return (
    <View>
      <Text className="text-base font-semibold self-center">Search Titles and Authors</Text>
      <TextInput
        className="border border-amber-900 rounded-md py-1 px-2 m-2 ml-0 bg-white"
        style={{ fontSize: 18 }}
        value={searchText}
        onChangeText={(e) => setSearchText(e)}
      />
    </View>
  );
};

export default SearchBooksSearch;

function fuseInit(list) {
  const fuseOptions = {
    // isCaseSensitive: false,
    // includeScore: false,
    // shouldSort: true,
    // includeMatches: false,
    // findAllMatches: false,
    // minMatchCharLength: 1,
    // location: 0,
    threshold: 0.5,
    // distance: 100,
    // useExtendedSearch: false,
    // ignoreLocation: false,
    // ignoreFieldNorm: false,
    // fieldNormWeight: 1,
    keys: ["title", "author"],
  };

  const fuse: Fuse<FlatFolderMetadata> = new Fuse(list, fuseOptions);
  return fuse;
  // return fuse.search(searchPattern);
}
