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
  const router = useRouter();
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
    return () => setSearchBarClearFn(null);
  }, [searchBarRef?.current?.clearText]);

  const debouncedSetSearchText = useCallback(
    debounce((searchValue) => handleUpdate(searchValue), 300),
    []
  );

  const handleUpdate = (searchValue: string) => {
    updateSearchObject({ authorOrTitle: searchValue });
  };

  if (isLoading) {
    return <ABSIsLoading />;
  }
  if (isError) {
    return (
      <ABSErrorView error={error} />
      // <View className="flex-col items-center">
      //   <Stack.Screen
      //     options={{
      //       headerSearchBarOptions: {},
      //     }}
      //   />
      //   <Text className="text-lg font-semibold">Error Getting Books</Text>
      //   <Text className="text-lg text-center">
      //     Make sure you have setup AudiobookShelf Login Info and that your ABS Server is running.
      //   </Text>
      //   <View className="flex-row justify-center">
      //     <Pressable
      //       onPress={() => router.push("/settings/authroute")}
      //       className="p-2 bg-abs-700 rounded-lg border border-abs-500"
      //     >
      //       <Text className="text-lg font-semibold text-white">Update ABS Info</Text>
      //     </Pressable>
      //   </View>
      // </View>
    );
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
            className="m-1 flex-row justify-start items-center px-2 py-1"
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
