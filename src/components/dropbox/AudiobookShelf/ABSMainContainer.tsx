import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { useGetAllABSBooks, useGetFilterData } from "@store/data/absHooks";
import { SearchObject, useABSStore } from "@store/store-abs";
import ABSBookResults from "./ABSBookResults";
import { colors } from "@constants/Colors";
import { Link, Stack, useNavigation, useRouter } from "expo-router";
import { SearchBarCommands } from "react-native-screens";
import ABSSearchChip from "./ABSSearchChip";
import ABSIsLoading from "./ABSIsLoading";
import ABSErrorView from "./ABSErrorView";
import ABSTagContextMenu from "./search/ABSTagContextMenu";
import ABSGenreContextMenu from "./search/ABSGenreContextMenu";
import { debounce } from "lodash";
import { useDropboxStore } from "@store/store-dropbox";

const parseSearchObject = (searchObject: SearchObject) => {
  return Object.entries(searchObject).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== "" && key !== "authorOrTitle") {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          acc[key] = value;
        }
      } else {
        acc[key] = value;
      }
    }
    return acc;
  }, {} as Partial<SearchObject>);
};
const ABSMainContainer = () => {
  const { books, totalBookCount, selectedBookCount, isError, isLoading, error } =
    useGetAllABSBooks();

  // Tags, Genres, etc
  const { filterData, isLoading: filterIsLoading, isError: filterIsError } = useGetFilterData();
  const updateSearchObject = useABSStore((state) => state.actions.updateSearchObject);
  const setSearchBarClearFn = useABSStore((state) => state.actions.setSearchBarClearFn);
  const searchObject = useABSStore((state) => state.searchObject);
  const searchBarRef = useRef<SearchBarCommands>();
  const navigation = useNavigation();
  const searchKeys = parseSearchObject(searchObject);

  // Setup react navigation search bar in header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        autoCapitalize: "none",
        placeholder: "Search Title/Author",
        ref: searchBarRef,
        barTintColor: colors.abs400,
        textColor: colors.abs900,
        hideNavigationBar: false,
        onChangeText: (event) => debouncedSetSearchText(event.nativeEvent.text),
      },
    });
  }, [navigation]);

  React.useEffect(() => {
    if (searchBarRef?.current) {
      setSearchBarClearFn(() => searchBarRef.current.clearText());
    }
    return () => setSearchBarClearFn(() => {});
  }, [searchBarRef?.current?.clearText]);

  const debouncedSetSearchText = useCallback(
    debounce((searchValue) => handleUpdate(searchValue), 300),
    []
  );

  const handleUpdate = (searchValue: string) => {
    updateSearchObject({ authorOrTitle: searchValue });
  };

  if (isLoading || filterIsLoading) {
    return <ABSIsLoading />;
  }
  if (isError || filterIsError) {
    // console.log("ABSMainContainer ERROR", error);
    return <ABSErrorView error={error} />;
  }

  return (
    <View className="flex-1 bg-abs-100">
      <View className="bg-amber-200" style={{ backgroundColor: colors.absLightBg }}>
        <View className="m-1 flex-row justify-between px-2 ">
          <Text className="text-sm text-amber-800">{selectedBookCount} books found</Text>

          <Text className="text-sm text-amber-800">{totalBookCount} total books</Text>
        </View>
        <View
          className="flex-row items-center justify-center px-2 py-1"
          style={{ borderTopColor: colors.amber800, borderTopWidth: StyleSheet.hairlineWidth }}
        >
          <ABSTagContextMenu allTags={filterData?.tags.map((el) => el.name)} />
          <View className="mr-5" />
          <ABSGenreContextMenu allGenres={filterData?.genres.map((el) => el.name)} />
        </View>
        {Object.keys(searchKeys).length > 0 && (
          <View
            className="flex-row justify-start items-center px-2 pb-1 flex-wrap"
            style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.abs600 }}
          >
            {Object.keys(searchKeys).map((key: keyof SearchObject) => (
              <View className="mr-1" key={key}>
                <ABSSearchChip activeSearchItemKey={key} activeSearchItemValue={searchKeys[key]} />
              </View>
            ))}
          </View>
        )}
      </View>

      <ABSBookResults books={books} />
    </View>
  );
};

export default ABSMainContainer;
