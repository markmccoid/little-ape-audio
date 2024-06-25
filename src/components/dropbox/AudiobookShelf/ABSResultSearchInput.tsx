import { View, TextInput, Text, Pressable } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ABSState } from "@store/store-abs";
import { debounce } from "lodash";
import { CloseIcon } from "@components/common/svg/Icons";

type Props = {
  updateSearch: (searchObject: ABSState["searchObject"]) => void;
};
const ABSResultSearchInput = ({ updateSearch }: Props) => {
  const [searchText, setSearchText] = useState("");
  const [searchField, setSearchField] = useState<keyof ABSState["searchObject"]>("title");

  const debouncedSetSearchText = useCallback(
    debounce((searchValue, searchField) => updateSearch({ searchField, searchValue }), 300),
    []
  );

  useEffect(() => {
    debouncedSetSearchText(searchText, searchField);
  }, [searchText, searchField]);

  return (
    <View className="flex-row m-1 justify-between">
      <View className="flex-grow">
        <TextInput
          className=" border border-gray-400 p-2 rounded-md bg-white"
          placeholder="Search"
          onChangeText={setSearchText}
          value={searchText}
        />
        <Pressable onPress={() => setSearchText(undefined)} className="absolute top-[7] right-1">
          <CloseIcon size={20} color="gray" />
        </Pressable>
      </View>
      <View className="flex-row `justify-center items-center mx-2 space-x-2">
        <Pressable
          onPress={() => setSearchField("title")}
          className={`border p-1 rounded-md bg-amber-600 border-amber-900 ${
            searchField === "title" && "bg-emerald-500 border-emerald-900"
          }`}
        >
          <Text className={`text-white ${searchField === "title" && "text-black"}`}>Title</Text>
        </Pressable>
        <Pressable
          onPress={() => setSearchField("author")}
          className={`border p-1 rounded-md bg-amber-600 border-amber-900 ${
            searchField === "author" && "bg-emerald-500 border-emerald-900"
          }`}
        >
          <Text className={`text-white ${searchField === "author" && "text-black"}`}>Author</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ABSResultSearchInput;
