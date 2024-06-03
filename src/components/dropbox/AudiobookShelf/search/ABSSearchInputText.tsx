import { View, TextInput, Text, Pressable } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ABSState, SearchObject } from "@store/store-abs";
import { debounce } from "lodash";
import { CloseIcon } from "@components/common/svg/Icons";

type Props = {
  updateSearch: (value: string) => void;
  label: string;
};
const ABSResultSearchInputText = ({ updateSearch, label }: Props) => {
  const [searchText, setSearchText] = useState("");

  const debouncedSetSearchText = useCallback(
    debounce((searchValue) => updateSearch(searchValue), 500),
    []
  );

  useEffect(() => {
    debouncedSetSearchText(searchText);
  }, [searchText]);

  return (
    // <View className="flex-row m-1 justify-between">
    <View className="flex-1">
      <TextInput
        className=" border border-gray-400 p-2 rounded-md bg-white"
        placeholder={label}
        onChangeText={setSearchText}
        value={searchText}
      />
      {searchText && (
        <Pressable onPress={() => setSearchText(undefined)} className="absolute top-[7] right-1">
          <CloseIcon size={20} color="gray" />
        </Pressable>
      )}
    </View>
    // </View>
  );
};

export default ABSResultSearchInputText;
