import { View, TextInput, Text, Pressable } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ABSState, SearchObject } from "@store/store-abs";
import { debounce } from "lodash";
import { CloseIcon } from "@components/common/svg/Icons";

type Props = {
  updateSearch: (value: string) => void;
  label: string;
  value?: string;
  showLabel?: boolean;
};
const ABSResultSearchInputText = ({ updateSearch, label, value, showLabel }: Props) => {
  const [searchText, setSearchText] = useState(value || "");

  const debouncedSetSearchText = useCallback(
    debounce((searchValue) => updateSearch(searchValue), 500),
    []
  );

  useEffect(() => {
    debouncedSetSearchText(searchText);
  }, [searchText]);

  return (
    <View className="flex-1">
      {showLabel && <Text className="text-base font-semibold">{label}</Text>}
      <View className="justify-center">
        <TextInput
          className=" border border-gray-400 p-2 rounded-md bg-white"
          placeholder={label}
          onChangeText={setSearchText}
          value={searchText}
        />
        {searchText && (
          <Pressable onPress={() => setSearchText(undefined)} className="absolute right-1">
            <CloseIcon size={20} color="gray" />
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default ABSResultSearchInputText;
